import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/conversations', NotificationController.getConversations);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
