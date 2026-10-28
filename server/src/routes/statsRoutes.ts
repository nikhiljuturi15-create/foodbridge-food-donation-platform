import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public platform-wide impact statistics
router.get('/platform', StatsController.getPlatformStats);

// Authenticated user-specific dashboard statistics
router.get('/dashboard', authenticate, StatsController.getUserDashboardStats);

export default router;
