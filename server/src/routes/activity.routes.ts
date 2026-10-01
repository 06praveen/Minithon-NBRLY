import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticateToken, ActivityController.getMyActivity);

export default router;
