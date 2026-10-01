import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.patch('/me', authenticateToken, UserController.updateMyProfile);
router.get('/:id', UserController.getPublicProfile);

export default router;
