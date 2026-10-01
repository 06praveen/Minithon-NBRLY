import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserBadgeService } from './user.service.js';

export class ReviewService {
  static async createReview(userId: string, requestId: string, data: { rating: number; comment: string }) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.status !== 'COMPLETED') throw new AppError('Can only review completed help requests.', 400);

    const isRequester = req.requesterId === userId;
    const isHelper = req.assignment?.helperId === userId;

    if (!isRequester && !isHelper) {
      throw new AppError('You were not a participant in this help request.', 403);
    }

    const revieweeId = isRequester ? req.assignment!.helperId : req.requesterId;

    if (userId === revieweeId) {
      throw new AppError('You cannot review yourself.', 400);
    }

    // Check for existing review by this reviewer for this request
    const existing = await prisma.review.findFirst({
      where: {
        requestId,
        reviewerId: userId,
      },
    });

    if (existing) {
      throw new AppError('You have already submitted a review for this request.', 409);
    }

    const review = await prisma.review.create({
      data: {
        requestId,
        reviewerId: userId,
        revieweeId,
        rating: data.rating,
        comment: data.comment.trim(),
      },
      include: {
        reviewer: { select: { name: true, avatar: true } },
      },
    });

    // Recompute reviewee's average rating
    const allReviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = allReviews.length > 0 ? Number((sum / allReviews.length).toFixed(1)) : 5.0;

    const updatedUser = await prisma.user.update({
      where: { id: revieweeId },
      data: { rating: avgRating },
    });

    // Re-evaluate badges in case rating threshold was reached
    await UserBadgeService.evaluateBadges(updatedUser);

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewer.name,
      reviewerAvatar: review.reviewer.avatar,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
