import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { updateProfileSchema } from '../validators/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class UserController {
  static async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getPublicProfile(req.params.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const user = await UserService.updateProfile(req.user!.id, validated);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}
