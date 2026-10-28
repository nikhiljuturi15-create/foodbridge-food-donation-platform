import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, isVerified, search } = req.query;
      const where: any = {};

      if (role) where.role = role;
      if (isVerified !== undefined) where.isVerified = isVerified === 'true';
      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { email: { contains: search as string } },
          { organizationType: { contains: search as string } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          city: true,
          organizationType: true,
          registrationNumber: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              requests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: Boolean(isVerified) },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationType: true,
          isVerified: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'USER_VERIFICATION_MODIFIED',
          details: JSON.stringify({ targetUserId: id, isVerified: user.isVerified }),
        },
      });

      res.status(200).json({
        success: true,
        message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, category, search } = req.query;
      const where: any = {};

      if (status && status !== 'ALL') where.status = status;
      if (category && category !== 'ALL') where.category = category;
      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { pickupCity: { contains: search as string } },
        ];
      }

      const listings = await prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          donor: {
            select: { id: true, name: true, email: true, organizationType: true, city: true, phone: true },
          },
          _count: {
            select: { requests: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        count: listings.length,
        listings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async moderateListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const listing = await prisma.listing.update({
        where: { id },
        data: { status },
        include: { donor: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'LISTING_MODERATED',
          details: JSON.stringify({ listingId: id, status, note }),
        },
      });

      res.status(200).json({
        success: true,
        message: `Listing status updated to ${status}`,
        listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
