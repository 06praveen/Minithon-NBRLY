import { Router } from 'express';
import { RequestController } from '../controllers/request.controller.js';
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
router.post('/:id/start', authenticateToken, RequestController.start);
router.post('/:id/complete', authenticateToken, RequestController.complete);
router.post('/:id/review', authenticateToken, RequestController.review);

export default router;
