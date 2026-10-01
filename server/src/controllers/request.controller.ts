import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/request.service.js';
import { ReviewService } from '../services/review.service.js';
import { createRequestSchema, updateRequestSchema, createReviewSchema } from '../validators/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

export class RequestController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let currentUser: any = undefined;
      if (req.user) {
        const u = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, neighborhood: true, skills: true },
        });
        if (u) currentUser = u;
      }

      const requests = await RequestService.listRequests({
        search: req.query.search as string,
        category: req.query.category as string,
        urgency: req.query.urgency as string,
        neighborhood: req.query.neighborhood as string,
        status: req.query.status as string,
        currentUser,
      });

      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let currentUser: any = undefined;
      if (req.user) {
        const u = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, neighborhood: true, skills: true },
        });
        if (u) currentUser = u;
      }

      const request = await RequestService.getById(req.params.id, currentUser);

      res.status(200).json({
        success: true,
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createRequestSchema.parse(req.body);
      const request = await RequestService.create(req.user!.id, validated);

      res.status(201).json({
        success: true,
        message: 'Help request created successfully.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateRequestSchema.parse(req.body);
      const request = await RequestService.update(req.user!.id, req.params.id, validated);

      res.status(200).json({
        success: true,
        message: 'Request updated.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.cancel(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Request cancelled.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async accept(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.accept(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Help request accepted.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async start(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.start(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Help is now in progress.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.complete(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Help request marked as completed.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async review(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createReviewSchema.parse(req.body);
      const review = await ReviewService.createReview(req.user!.id, req.params.id, validated);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        data: { review },
      });
    } catch (err) {
      next(err);
    }
  }
}
