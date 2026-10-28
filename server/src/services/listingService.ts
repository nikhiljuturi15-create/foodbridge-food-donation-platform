import { prisma } from '../utils/prisma';
import { AppError } from './requestService';

export interface ListingFilterParams {
  category?: string;
  dietaryInfo?: string;
  city?: string;
  search?: string;
  status?: string;
  sortBy?: 'urgency' | 'newest' | 'quantity';
}

export class ListingService {
  /**
   * Create a new food listing by a donor.
   */
  static async createListing(donorId: string, data: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    dietaryInfo?: string;
    preparedAt?: string;
    useBy: string;
    pickupWindowStart: string;
    pickupWindowEnd: string;
    pickupAddress: string;
    pickupCity: string;
    storageInstructions?: string;
    foodSafetyConfirmed: boolean;
    imageUrl?: string;
  }) {
    if (!data.foodSafetyConfirmed) {
      throw new AppError('You must acknowledge and confirm food safety standards to list food', 400);
    }

    const useByDate = new Date(data.useBy);
    const windowStartDate = new Date(data.pickupWindowStart);
    const windowEndDate = new Date(data.pickupWindowEnd);
    const now = new Date();

    if (isNaN(useByDate.getTime()) || isNaN(windowStartDate.getTime()) || isNaN(windowEndDate.getTime())) {
      throw new AppError('Invalid date/time format provided', 400);
    }

    if (windowEndDate <= windowStartDate) {
      throw new AppError('Pickup window end time must be after the start time', 400);
    }

    if (useByDate < now) {
      throw new AppError('Use-by date cannot be in the past', 400);
    }

    const listing = await prisma.listing.create({
      data: {
        donorId,
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        dietaryInfo: data.dietaryInfo,
        preparedAt: data.preparedAt ? new Date(data.preparedAt) : undefined,
        useBy: useByDate,
        pickupWindowStart: windowStartDate,
        pickupWindowEnd: windowEndDate,
        pickupAddress: data.pickupAddress,
        pickupCity: data.pickupCity,
        storageInstructions: data.storageInstructions,
        foodSafetyConfirmed: true,
        status: 'AVAILABLE',
        imageUrl: data.imageUrl,
      },
      include: {
        donor: {
          select: { id: true, name: true, organizationType: true, city: true, phone: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: donorId,
        action: 'LISTING_CREATED',
        details: JSON.stringify({ listingId: listing.id, title: listing.title, category: listing.category }),
      },
    });

    return listing;
  }

  /**
   * Search and filter food listings.
   */
  static async getListings(filters: ListingFilterParams) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      // By default, show active available or requested listings
      where.status = { in: ['AVAILABLE', 'REQUESTED'] };
    }

    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    if (filters.dietaryInfo && filters.dietaryInfo !== 'ALL') {
      where.dietaryInfo = filters.dietaryInfo;
    }

    if (filters.city) {
      where.pickupCity = { contains: filters.city };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { pickupAddress: { contains: filters.search } },
        { pickupCity: { contains: filters.search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'urgency') {
      orderBy = { useBy: 'asc' };
    } else if (filters.sortBy === 'quantity') {
      orderBy = { quantity: 'desc' };
    } else if (filters.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    return await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        donor: {
          select: { id: true, name: true, organizationType: true, city: true, phone: true },
        },
        _count: {
          select: { requests: true },
        },
      },
    });
  }

  /**
   * Get single listing by id.
   */
  static async getListingById(id: string, requesterUserId?: string, requesterRole?: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        donor: {
          select: { id: true, name: true, email: true, organizationType: true, city: true, phone: true, address: true },
        },
        requests: requesterRole === 'ADMIN' || requesterUserId
          ? {
              include: {
                recipient: {
                  select: { id: true, name: true, email: true, organizationType: true, phone: true },
                },
              },
            }
          : false,
      },
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    return listing;
  }

  /**
   * Update listing. Permitted only to donor owner or admin, and only if AVAILABLE.
   */
  static async updateListing(userId: string, userRole: string, id: string, updates: Partial<{
    title: string;
    description: string;
    quantity: number;
    unit: string;
    dietaryInfo?: string;
    pickupWindowStart: string;
    pickupWindowEnd: string;
    pickupAddress: string;
    pickupCity: string;
    storageInstructions?: string;
    status: string;
  }>) {
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Listing not found', 404);
    }

    if (existing.donorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Unauthorized: You can only edit your own listings', 403);
    }

    if (existing.status !== 'AVAILABLE' && userRole !== 'ADMIN') {
      throw new AppError(`Cannot edit listing with status '${existing.status}'`, 400);
    }

    const data: any = { ...updates };
    if (updates.pickupWindowStart) data.pickupWindowStart = new Date(updates.pickupWindowStart);
    if (updates.pickupWindowEnd) data.pickupWindowEnd = new Date(updates.pickupWindowEnd);

    const updated = await prisma.listing.update({
      where: { id },
      data,
      include: {
        donor: {
          select: { id: true, name: true, organizationType: true, city: true, phone: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LISTING_UPDATED',
        details: JSON.stringify({ listingId: id, updates }),
      },
    });

    return updated;
  }

  /**
   * Delete or cancel a listing.
   */
  static async deleteListing(userId: string, userRole: string, id: string) {
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Listing not found', 404);
    }

    if (existing.donorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Unauthorized: You can only delete your own listings', 403);
    }

    if (existing.status === 'COMPLETED') {
      throw new AppError('Cannot delete a completed donation listing', 400);
    }

    // Cancel related requests
    await prisma.donationRequest.updateMany({
      where: { listingId: id, status: { in: ['PENDING', 'ACCEPTED'] } },
      data: { status: 'CANCELLED', cancellationReason: 'Listing removed by donor/administrator' },
    });

    const deleted = await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LISTING_CANCELLED',
        details: JSON.stringify({ listingId: id }),
      },
    });

    return deleted;
  }
}
