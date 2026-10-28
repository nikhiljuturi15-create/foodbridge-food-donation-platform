import { Router } from 'express';
import { ListingController } from '../controllers/listingController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { validateBody } from '../middlewares/validate';
import { createListingSchema, updateListingSchema } from '../validations/schemas';

const router = Router();

// Publicly viewable listings
router.get('/', ListingController.getAll);
router.get('/:id', ListingController.getById);

// Donor-restricted endpoints
router.post(
  '/',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  validateBody(createListingSchema),
  ListingController.create
);

router.get(
  '/donor/mine',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  ListingController.getMyListings
);

router.put(
  '/:id',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  validateBody(updateListingSchema),
  ListingController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  ListingController.delete
);

export default router;
