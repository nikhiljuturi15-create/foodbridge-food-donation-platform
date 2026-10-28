import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listingService';
import { prisma } from '../utils/prisma';

export class ListingController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = req.user!.userId;
      const listing = await ListingService.createListing(donorId, req.body);
      res.status(201).json({
        success: true,
        message: 'Food donation listing created successfully',
        listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, dietaryInfo, city, search, status, sortBy } = req.query;
      const listings = await ListingService.getListings({
        category: category as string,
        dietaryInfo: dietaryInfo as string,
        city: city as string,
        search: search as string,
        status: status as string,
        sortBy: sortBy as any,
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

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const listing = await ListingService.getListingById(
        id,
        req.user?.userId,
        req.user?.role
      );

      res.status(200).json({
        success: true,
        listing,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = req.user!.userId;
      const listings = await prisma.listing.findMany({
        where: { donorId },
        orderBy: { createdAt: 'desc' },
        include: {
          requests: {
            include: {
              recipient: {
                select: { id: true, name: true, email: true, phone: true, organizationType: true },
              },
            },
            orderBy: { createdAt: 'desc' },
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

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const updated = await ListingService.updateListing(userId, userRole, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        listing: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const deleted = await ListingService.deleteListing(userId, userRole, id);
      res.status(200).json({
        success: true,
        message: 'Listing cancelled/removed successfully',
        listing: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}
