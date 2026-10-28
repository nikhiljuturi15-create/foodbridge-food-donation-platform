import { Router } from 'express';
import { RequestController } from '../controllers/requestController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { validateBody } from '../middlewares/validate';
import { createRequestSchema, reasonSchema, completePickupSchema } from '../validations/schemas';

const router = Router();

// Recipient creates request
router.post(
  '/',
  authenticate,
  requireRole(['RECIPIENT']),
  validateBody(createRequestSchema),
  RequestController.create
);

// Recipient gets own requests
router.get(
  '/recipient/mine',
  authenticate,
  requireRole(['RECIPIENT']),
  RequestController.getMyRequests
);

// Donor gets incoming requests for their listings
router.get(
  '/donor/incoming',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  RequestController.getIncomingRequests
);

// Donor accepts request
router.post(
  '/:id/accept',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  RequestController.accept
);

// Donor rejects request
router.post(
  '/:id/reject',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  validateBody(reasonSchema),
  RequestController.reject
);

// Recipient cancels request
router.post(
  '/:id/cancel',
  authenticate,
  requireRole(['RECIPIENT']),
  validateBody(reasonSchema),
  RequestController.cancel
);

// Pickup completion (Donor, Recipient, or Admin)
router.post(
  '/:id/complete',
  authenticate,
  validateBody(completePickupSchema),
  RequestController.complete
);

export default router;
