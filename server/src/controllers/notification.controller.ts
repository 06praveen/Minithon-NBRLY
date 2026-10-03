import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotificationService, NotificationTab } from '../services/notification.service.js';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tab = (req.query.tab as NotificationTab) || 'all';
      const notifications = await NotificationService.getNotifications(req.user!.id, tab);
      res.status(200).json({
        success: true,
        data: { notifications },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const unreadCount = await NotificationService.getUnreadCount(req.user!.id);
      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.markAsRead(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: { notification: result },
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await NotificationService.getConversationsSummary(req.user!.id);
      res.status(200).json({
        success: true,
        data: { conversations },
      });
    } catch (err) {
      next(err);
    }
  }
}
