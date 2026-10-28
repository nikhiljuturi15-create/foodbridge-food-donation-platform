import { prisma } from '../utils/prisma';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class RequestService {
  /**
   * Recipient creates a donation claim request.
   */
  static async createRequest(recipientId: string, data: {
    listingId: string;
    requestedQuantity: number;
    pickupTime?: string;
    purpose?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: data.listingId },
      });

      if (!listing) {
        throw new AppError('Listing not found', 404);
      }

      // Check if listing is expired
      const now = new Date();
      if (new Date(listing.useBy) < now || new Date(listing.pickupWindowEnd) < now) {
        await tx.listing.update({
          where: { id: listing.id },
          data: { status: 'EXPIRED' },
        });
        throw new AppError('Cannot request an expired donation listing', 400);
      }

      // Check availability status
      if (listing.status !== 'AVAILABLE' && listing.status !== 'REQUESTED') {
        throw new AppError(`Listing is currently ${listing.status.toLowerCase()} and cannot be requested`, 409);
      }

      // Check if this recipient already has a pending or accepted request for this listing
      const existing = await tx.donationRequest.findFirst({
        where: {
          listingId: data.listingId,
          recipientId,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
      });

      if (existing) {
        throw new AppError('You already have an active request for this listing', 400);
      }

      if (data.requestedQuantity > listing.quantity) {
        throw new AppError(`Requested quantity (${data.requestedQuantity} ${listing.unit}) exceeds available quantity (${listing.quantity} ${listing.unit})`, 400);
      }

      const request = await tx.donationRequest.create({
        data: {
          listingId: data.listingId,
          recipientId,
          requestedQuantity: data.requestedQuantity,
          pickupTime: data.pickupTime ? new Date(data.pickupTime) : undefined,
          purpose: data.purpose,
          status: 'PENDING',
        },
        include: {
          listing: true,
          recipient: {
            select: { id: true, name: true, email: true, organizationType: true, phone: true },
          },
        },
      });

      // Update listing status to REQUESTED if it was AVAILABLE
      if (listing.status === 'AVAILABLE') {
        await tx.listing.update({
          where: { id: listing.id },
          data: { status: 'REQUESTED' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: recipientId,
          action: 'REQUEST_CREATED',
          details: JSON.stringify({ requestId: request.id, listingId: listing.id, quantity: data.requestedQuantity }),
        },
      });

      return request;
    });
  }

  /**
   * Donor accepts a request. Implements strict atomic concurrency check to prevent double-booking.
   */
  static async acceptRequest(donorId: string, requestId: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.donationRequest.findUnique({
        where: { id: requestId },
        include: { listing: true, recipient: true },
      });

      if (!request) {
        throw new AppError('Donation request not found', 404);
      }

      if (request.listing.donorId !== donorId) {
        throw new AppError('Unauthorized: You are not the donor of this listing', 403);
      }

      if (request.status !== 'PENDING') {
        throw new AppError(`Cannot accept request in '${request.status}' status`, 400);
      }

      // Check current listing status - Double Booking Guard!
      if (request.listing.status === 'CONFIRMED' || request.listing.status === 'COMPLETED') {
        throw new AppError('Conflict: This listing has already been confirmed or completed for another request', 409);
      }

      // Check expiry
      const now = new Date();
      if (new Date(request.listing.useBy) < now || new Date(request.listing.pickupWindowEnd) < now) {
        await tx.listing.update({
          where: { id: request.listingId },
          data: { status: 'EXPIRED' },
        });
        throw new AppError('Cannot accept request for an expired listing', 400);
      }

      // Generate a secure 4-digit verification code for handover
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // 1. Mark this request as ACCEPTED
      const updatedRequest = await tx.donationRequest.update({
        where: { id: requestId },
        data: {
          status: 'ACCEPTED',
          verificationCode,
        },
        include: {
          listing: true,
          recipient: {
            select: { id: true, name: true, email: true, phone: true, organizationType: true },
          },
        },
      });

      // 2. Mark listing as CONFIRMED
      await tx.listing.update({
        where: { id: request.listingId },
        data: { status: 'CONFIRMED' },
      });

      // 3. Automatically reject any other pending requests for this listing
      await tx.donationRequest.updateMany({
        where: {
          listingId: request.listingId,
          id: { not: requestId },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Listing fulfilled by another recipient organization',
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: donorId,
          action: 'REQUEST_ACCEPTED',
          details: JSON.stringify({ requestId, listingId: request.listingId, verificationCode }),
        },
      });

      return updatedRequest;
    });
  }

  /**
   * Donor rejects a request.
   */
  static async rejectRequest(donorId: string, requestId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.donationRequest.findUnique({
        where: { id: requestId },
        include: { listing: true },
      });

      if (!request) {
        throw new AppError('Donation request not found', 404);
      }

      if (request.listing.donorId !== donorId) {
        throw new AppError('Unauthorized: You are not the donor of this listing', 403);
      }

      if (request.status !== 'PENDING') {
        throw new AppError(`Cannot reject request in '${request.status}' status`, 400);
      }

      const updatedRequest = await tx.donationRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || 'Declined by donor',
        },
      });

      // Check if there are remaining pending requests for this listing
      const remainingPending = await tx.donationRequest.count({
        where: {
          listingId: request.listingId,
          status: 'PENDING',
        },
      });

      // If no other pending requests and listing is not confirmed, set back to AVAILABLE
      if (remainingPending === 0 && request.listing.status === 'REQUESTED') {
        await tx.listing.update({
          where: { id: request.listingId },
          data: { status: 'AVAILABLE' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: donorId,
          action: 'REQUEST_REJECTED',
          details: JSON.stringify({ requestId, reason }),
        },
      });

      return updatedRequest;
    });
  }

  /**
   * Recipient cancels their request.
   */
  static async cancelRequest(recipientId: string, requestId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.donationRequest.findUnique({
        where: { id: requestId },
        include: { listing: true },
      });

      if (!request) {
        throw new AppError('Donation request not found', 404);
      }

      if (request.recipientId !== recipientId) {
        throw new AppError('Unauthorized: You can only cancel your own requests', 403);
      }

      if (request.status !== 'PENDING' && request.status !== 'ACCEPTED') {
        throw new AppError(`Cannot cancel a request that is already ${request.status.toLowerCase()}`, 400);
      }

      const updatedRequest = await tx.donationRequest.update({
        where: { id: requestId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Cancelled by recipient',
        },
      });

      // If the request was ACCEPTED, revert the listing back to AVAILABLE so other recipients can claim it!
      if (request.status === 'ACCEPTED') {
        await tx.listing.update({
          where: { id: request.listingId },
          data: { status: 'AVAILABLE' },
        });
      } else if (request.status === 'PENDING') {
        // If it was PENDING, check if there are other pending requests
        const remainingPending = await tx.donationRequest.count({
          where: {
            listingId: request.listingId,
            status: 'PENDING',
          },
        });
        if (remainingPending === 0 && request.listing.status === 'REQUESTED') {
          await tx.listing.update({
            where: { id: request.listingId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: recipientId,
          action: 'REQUEST_CANCELLED',
          details: JSON.stringify({ requestId, reason }),
        },
      });

      return updatedRequest;
    });
  }

  /**
   * Confirm pickup and mark donation as COMPLETED.
   */
  static async completePickup(userId: string, userRole: string, requestId: string, code?: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.donationRequest.findUnique({
        where: { id: requestId },
        include: { listing: true },
      });

      if (!request) {
        throw new AppError('Donation request not found', 404);
      }

      // Either donor or recipient can initiate/confirm
      const isDonor = request.listing.donorId === userId;
      const isRecipient = request.recipientId === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isDonor && !isRecipient && !isAdmin) {
        throw new AppError('Unauthorized: Only the donor, recipient, or admin can complete pickup', 403);
      }

      if (request.status !== 'ACCEPTED') {
        throw new AppError(`Cannot complete pickup for request with status '${request.status}' (must be ACCEPTED)`, 400);
      }

      // If code is provided, verify it
      if (code && request.verificationCode && code !== request.verificationCode) {
        throw new AppError('Invalid verification handover code', 400);
      }

      const updatedRequest = await tx.donationRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
        include: {
          listing: true,
          recipient: {
            select: { id: true, name: true, organizationType: true },
          },
        },
      });

      await tx.listing.update({
        where: { id: request.listingId },
        data: { status: 'COMPLETED' },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'PICKUP_COMPLETED',
          details: JSON.stringify({ requestId, listingId: request.listingId }),
        },
      });

      return updatedRequest;
    });
  }
}
