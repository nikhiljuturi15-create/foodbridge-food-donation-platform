import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { validateBody } from '../middlewares/validate';
import { verifyUserSchema } from '../validations/schemas';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/verify', validateBody(verifyUserSchema), AdminController.verifyUser);
router.get('/listings', AdminController.getAllListings);
router.patch('/listings/:id/moderate', AdminController.moderateListing);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
