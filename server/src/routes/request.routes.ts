import { Router } from 'express';
import { RequestController } from '../controllers/request.controller.js';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

// Public / optionally authenticated
router.get('/', optionalAuthenticateToken, RequestController.list);
router.get('/:id', optionalAuthenticateToken, RequestController.getById);

// Protected routes
router.post('/', authenticateToken, RequestController.create);
router.patch('/:id', authenticateToken, RequestController.update);
router.delete('/:id', authenticateToken, RequestController.cancel);

// Help Lifecycle Transitions
router.post('/:id/accept', authenticateToken, RequestController.accept);
router.patch('/:id/accept', authenticateToken, RequestController.accept);
router.post('/:id/start', authenticateToken, RequestController.start);
router.patch('/:id/start', authenticateToken, RequestController.start);
router.post('/:id/request-completion', authenticateToken, RequestController.requestCompletion);
router.patch('/:id/request-completion', authenticateToken, RequestController.requestCompletion);
router.post('/:id/confirm-completion', authenticateToken, RequestController.confirmCompletion);
router.patch('/:id/confirm-completion', authenticateToken, RequestController.confirmCompletion);
router.post('/:id/reject-completion', authenticateToken, RequestController.rejectCompletion);
router.patch('/:id/reject-completion', authenticateToken, RequestController.rejectCompletion);

// Request-Specific Private Chat
router.get('/:requestId/chat', authenticateToken, ChatController.getChat);
router.post('/:requestId/chat/messages', authenticateToken, ChatController.sendMessage);

// Two-Way Reviews
router.get('/:id/reviews', optionalAuthenticateToken, RequestController.getReviews);
router.post('/:id/reviews', authenticateToken, RequestController.review);
router.post('/:id/review', authenticateToken, RequestController.review); // Legacy compatibility

export default router;
