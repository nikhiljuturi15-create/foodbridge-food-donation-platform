import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/requestService';
import { prisma } from '../utils/prisma';

export class RequestController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipientId = req.user!.userId;
      const request = await RequestService.createRequest(recipientId, req.body);
      res.status(201).json({
        success: true,
        message: 'Donation claim request submitted successfully',
        request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipientId = req.user!.userId;
      const requests = await prisma.donationRequest.findMany({
        where: { recipientId },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              donor: {
                select: { id: true, name: true, email: true, phone: true, organizationType: true, city: true },
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIncomingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = req.user!.userId;
      const requests = await prisma.donationRequest.findMany({
        where: {
          listing: {
            donorId,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: true,
          recipient: {
            select: { id: true, name: true, email: true, phone: true, organizationType: true, isVerified: true, city: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = req.user!.userId;
      const { id } = req.params;
      const request = await RequestService.acceptRequest(donorId, id);
      res.status(200).json({
        success: true,
        message: 'Donation request accepted. Pickup code generated.',
        request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body;
      const request = await RequestService.rejectRequest(donorId, id, reason);
      res.status(200).json({
        success: true,
        message: 'Donation request rejected',
        request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipientId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body;
      const request = await RequestService.cancelRequest(recipientId, id, reason);
      res.status(200).json({
        success: true,
        message: 'Donation request cancelled successfully',
        request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { verificationCode } = req.body;

      const request = await RequestService.completePickup(userId, userRole, id, verificationCode);
      res.status(200).json({
        success: true,
        message: 'Donation pickup confirmed and marked as COMPLETED!',
        request,
      });
    } catch (error) {
      next(error);
    }
  }
}
