import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ChatService } from '../services/chat.service.js';

export class ChatController {
  static async getChat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ChatService.getChat(req.params.requestId, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = req.body;
      const message = await ChatService.sendMessage(req.params.requestId, req.user!.id, content);
      res.status(201).json({
        success: true,
        message: 'Message sent.',
        data: { message },
      });
    } catch (err) {
      next(err);
    }
  }
}
