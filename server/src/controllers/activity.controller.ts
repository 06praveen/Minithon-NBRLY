import { Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ActivityController {
  static async getMyActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await CommunityService.getUserActivity(req.user!.id);
      res.status(200).json({
        success: true,
        data: { activities },
      });
    } catch (err) {
      next(err);
    }
  }
}
