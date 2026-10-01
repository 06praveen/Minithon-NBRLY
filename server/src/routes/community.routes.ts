import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller.js';

const router = Router();

router.get('/stats', CommunityController.getStats);
router.get('/activity', CommunityController.getActivityFeed);

export default router;
