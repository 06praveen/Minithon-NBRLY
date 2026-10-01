import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NeighborMatchService } from './neighborMatch.service.js';
import { UserBadgeService } from './user.service.js';

export class RequestService {
  static async listRequests(query: {
    search?: string;
    category?: string;
    urgency?: string;
    neighborhood?: string;
    status?: string;
    currentUser?: { id: string; neighborhood: string; skills: string[] };
  }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    } else {
      // Default to non-cancelled
      where.status = { not: 'CANCELLED' };
    }

    if (query.category && query.category !== 'All Categories') {
      where.category = query.category;
    }

    if (query.urgency && query.urgency !== 'ALL') {
      where.urgency = query.urgency;
    }

    if (query.neighborhood && query.neighborhood !== 'ALL') {
      where.neighborhood = { contains: query.neighborhood, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { neighborhood: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const requests = await prisma.helpRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            completedHelps: true,
            neighborhood: true,
          },
        },
        assignment: {
          include: {
            helper: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                completedHelps: true,
                neighborhood: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((req) => {
      let matchScore: number | undefined;
      let matchReasons: string[] | undefined;

      if (query.currentUser && query.currentUser.id !== req.requesterId) {
        const match = NeighborMatchService.calculateMatch({
          userNeighborhood: query.currentUser.neighborhood,
          userSkills: query.currentUser.skills || [],
          requestNeighborhood: req.neighborhood,
          requestCategory: req.category,
          requestUrgency: req.urgency as any,
          requestDate: req.preferredDate,
        });
        matchScore = match.score;
        matchReasons = match.reasons;
      } else {
        // Deterministic default match score
        matchScore = 92;
        matchReasons = ['Same neighborhood (Bandra West)', 'High proximity score'];
      }

      return {
        id: req.id,
        title: req.title,
        description: req.description,
        category: req.category,
        urgency: req.urgency,
        neighborhood: req.neighborhood,
        preferredDate: req.preferredDate,
        preferredTime: req.preferredTime,
        reward: req.reward || undefined,
        status: req.status,
        matchScore,
        matchReasons,
        requester: req.requester,
        helper: req.assignment?.helper || null,
        createdAt: req.createdAt.toISOString(),
      };
    });
  }

  static async getById(requestId: string, currentUser?: { id: string; neighborhood: string; skills: string[] }) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            completedHelps: true,
            neighborhood: true,
            bio: true,
            skills: true,
            joinedAt: true,
          },
        },
        assignment: {
          include: {
            helper: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                completedHelps: true,
                neighborhood: true,
                skills: true,
              },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!req) {
      throw new AppError('Help request not found.', 404);
    }

    let matchScore = 94;
    let matchReasons = [
      'Same neighborhood (Bandra West)',
      'Direct skill match for category',
      'Available within time slot',
    ];

    if (currentUser && currentUser.id !== req.requesterId) {
      const match = NeighborMatchService.calculateMatch({
        userNeighborhood: currentUser.neighborhood,
        userSkills: currentUser.skills || [],
        requestNeighborhood: req.neighborhood,
        requestCategory: req.category,
        requestUrgency: req.urgency as any,
        requestDate: req.preferredDate,
      });
      matchScore = match.score;
      matchReasons = match.reasons;
    }

    return {
      id: req.id,
      title: req.title,
      description: req.description,
      category: req.category,
      urgency: req.urgency,
      neighborhood: req.neighborhood,
      preferredDate: req.preferredDate,
      preferredTime: req.preferredTime,
      reward: req.reward || undefined,
      status: req.status,
      matchScore,
      matchReasons,
      requester: req.requester,
      helper: req.assignment?.helper || null,
      reviews: req.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewer.name,
        reviewerAvatar: r.reviewer.avatar,
        createdAt: r.createdAt.toISOString(),
      })),
      createdAt: req.createdAt.toISOString(),
    };
  }

  static async create(userId: string, data: {
    title: string;
    description: string;
    category: string;
    urgency: 'URGENT' | 'TODAY' | 'FLEXIBLE';
    neighborhood: string;
    preferredDate: string;
    preferredTime: string;
    reward?: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    const request = await prisma.helpRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        neighborhood: data.neighborhood,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        reward: data.reward,
        status: 'OPEN',
        requesterId: userId,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            completedHelps: true,
            neighborhood: true,
          },
        },
      },
    });

    // Update user created helps count
    await prisma.user.update({
      where: { id: userId },
      data: { createdHelpsCount: { increment: 1 } },
    });

    // Add community feed activity
    await prisma.communityActivity.create({
      data: {
        type: 'REQUEST_CREATED',
        userName: user.name,
        requestTitle: request.title,
        timestamp: 'Just now',
      },
    });

    return request;
  }

  static async update(userId: string, requestId: string, data: any) {
    const req = await prisma.helpRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new AppError('Request not found.', 404);
    if (req.requesterId !== userId) throw new AppError('Only the requester can edit this request.', 403);
    if (req.status !== 'OPEN') throw new AppError('Cannot edit request once it has been accepted.', 400);

    return prisma.helpRequest.update({
      where: { id: requestId },
      data,
      include: { requester: true },
    });
  }

  static async cancel(userId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new AppError('Request not found.', 404);
    if (req.requesterId !== userId) throw new AppError('Only the requester can cancel this request.', 403);
    if (req.status === 'COMPLETED') throw new AppError('Cannot cancel a completed request.', 400);

    const updated = await prisma.helpRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
      include: { requester: true },
    });

    await prisma.assignment.updateMany({
      where: { requestId },
      data: { status: 'CANCELLED' },
    });

    return updated;
  }

  static async accept(helperId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.requesterId === helperId) throw new AppError('You cannot accept your own help request.', 400);
    if (req.status !== 'OPEN') throw new AppError('This request has already been accepted or closed.', 400);
    if (req.assignment) throw new AppError('A helper has already been assigned.', 400);

    const helper = await prisma.user.findUnique({ where: { id: helperId } });
    if (!helper) throw new AppError('Helper not found.', 404);

    // Create assignment and update request
    const assignment = await prisma.assignment.create({
      data: {
        requestId,
        helperId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    const updatedRequest = await prisma.helpRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });

    // Record community activity
    await prisma.communityActivity.create({
      data: {
        type: 'HELP_ACCEPTED',
        userName: helper.name,
        targetName: req.requester.name,
        requestTitle: req.title,
        timestamp: 'Just now',
      },
    });

    return updatedRequest;
  }

  static async start(helperId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.status !== 'ACCEPTED') throw new AppError('Request must be in ACCEPTED status to start.', 400);
    if (!req.assignment || req.assignment.helperId !== helperId) {
      throw new AppError('Only the assigned helper can start this help.', 403);
    }

    await prisma.assignment.update({
      where: { requestId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    return prisma.helpRequest.update({
      where: { id: requestId },
      data: { status: 'IN_PROGRESS' },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });
  }

  static async complete(helperId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.status !== 'IN_PROGRESS') throw new AppError('Request must be IN_PROGRESS to complete.', 400);
    if (!req.assignment || req.assignment.helperId !== helperId) {
      throw new AppError('Only the assigned helper can complete this help.', 403);
    }

    const helper = await prisma.user.findUnique({ where: { id: helperId } });
    if (!helper) throw new AppError('Helper not found.', 404);

    await prisma.assignment.update({
      where: { requestId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    const updatedRequest = await prisma.helpRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED' },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });

    // Increment completed helps count
    const updatedHelper = await prisma.user.update({
      where: { id: helperId },
      data: { completedHelps: { increment: 1 } },
    });

    // Evaluate and auto-award badges
    await UserBadgeService.evaluateBadges(updatedHelper);

    // Record community activity
    await prisma.communityActivity.create({
      data: {
        type: 'HELP_COMPLETED',
        userName: helper.name,
        targetName: req.requester.name,
        requestTitle: req.title,
        timestamp: 'Just now',
      },
    });

    return updatedRequest;
  }
}
