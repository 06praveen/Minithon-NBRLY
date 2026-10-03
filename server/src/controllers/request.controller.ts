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
          select: { id: true, neighborhood: true, skills: true, latitude: true, longitude: true },
        });
        if (u) currentUser = u;
      }

      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
      const sortBy = req.query.sortBy as any;

      const requests = await RequestService.listRequests({
        search: req.query.search as string,
        category: req.query.category as string,
        urgency: req.query.urgency as string,
        neighborhood: req.query.neighborhood as string,
        status: req.query.status as string,
        lat: !isNaN(lat!) ? lat : undefined,
        lng: !isNaN(lng!) ? lng : undefined,
        radius: !isNaN(radius!) ? radius : undefined,
        sortBy,
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
          select: { id: true, neighborhood: true, skills: true, latitude: true, longitude: true },
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
      const result = await RequestService.accept(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Help request accepted.',
        data: {
          request: result.request,
          assignment: result.assignment,
          conversation: result.conversation,
        },
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

  static async requestCompletion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.requestCompletion(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Completion requested. Waiting for requester confirmation.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async confirmCompletion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.confirmCompletion(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Help completion confirmed! You can now review your helper.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectCompletion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await RequestService.rejectCompletion(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Completion postponed. Request remains in progress.',
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await ReviewService.getReviewsByRequest(req.params.id);

      res.status(200).json({
        success: true,
        data: { reviews },
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
