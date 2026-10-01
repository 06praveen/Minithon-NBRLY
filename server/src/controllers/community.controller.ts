import { Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service.js';

export class CommunityController {
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await CommunityService.getStats();
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getActivityFeed(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await CommunityService.getActivityFeed();
      res.status(200).json({
        success: true,
        data: { activities },
      });
    } catch (err) {
      next(err);
    }
  }
}
