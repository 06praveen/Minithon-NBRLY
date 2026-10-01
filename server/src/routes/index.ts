import { Router } from 'express';
import authRoutes from './auth.routes.js';
import requestRoutes from './request.routes.js';
import userRoutes from './user.routes.js';
import activityRoutes from './activity.routes.js';
import communityRoutes from './community.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/users', userRoutes);
router.use('/activity', activityRoutes);
router.use('/community', communityRoutes);

export default router;
