import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NeighborMatchService } from './neighborMatch.service.js';
import { LocationService } from './location.service.js';
import { UserBadgeService } from './user.service.js';
import { NotificationService } from './notification.service.js';

export class RequestService {
  static async listRequests(query: {
    search?: string;
    category?: string;
    urgency?: string;
    neighborhood?: string;
    status?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    sortBy?: 'nearest' | 'recommended' | 'urgent' | 'newest';
    currentUser?: {
      id: string;
      neighborhood: string;
      skills: string[];
      latitude?: number | null;
      longitude?: number | null;
    };
  }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    } else {
      // Default to non-cancelled
      where.status = { not: 'CANCELLED' };
    }

    if (query.category && query.category !== 'All Categories' && query.category !== 'All') {
      where.category = query.category;
    }

    if (query.urgency && query.urgency !== 'ALL' && query.urgency !== 'All') {
      where.urgency = query.urgency;
    }

    if (query.neighborhood && query.neighborhood !== 'ALL' && query.neighborhood !== 'All') {
      where.neighborhood = { contains: query.neighborhood, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { neighborhood: { contains: query.search, mode: 'insensitive' } },
        { locationName: { contains: query.search, mode: 'insensitive' } },
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
            locationName: true,
            latitude: true,
            longitude: true,
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
                locationName: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Reference coordinates for distance calculation: Database authenticated user location > query param
    const refLat = query.currentUser?.latitude !== undefined && query.currentUser?.latitude !== null
      ? query.currentUser.latitude
      : query.lat;
    const refLng = query.currentUser?.longitude !== undefined && query.currentUser?.longitude !== null
      ? query.currentUser.longitude
      : query.lng;
    const hasRefCoords = refLat !== undefined && refLat !== null && refLng !== undefined && refLng !== null;

    let results = requests.map((req) => {
      let distanceKm: number | null = null;

      // Calculate distance if both reference and request have coordinates
      const reqLat = req.latitude ?? req.requester.latitude;
      const reqLng = req.longitude ?? req.requester.longitude;

      if (hasRefCoords && reqLat !== null && reqLat !== undefined && reqLng !== null && reqLng !== undefined) {
        distanceKm = LocationService.calculateDistanceKm(refLat!, refLng!, reqLat, reqLng);
      }

      let matchScore: number | undefined;
      let matchReasons: string[] | undefined;

      if (query.currentUser && query.currentUser.id !== req.requesterId) {
        const match = NeighborMatchService.calculateMatch({
          userNeighborhood: query.currentUser.neighborhood,
          userSkills: query.currentUser.skills || [],
          userLat: query.currentUser.latitude,
          userLng: query.currentUser.longitude,
          requestNeighborhood: req.neighborhood,
          requestCategory: req.category,
          requestUrgency: req.urgency as any,
          requestDate: req.preferredDate,
          requestLat: reqLat,
          requestLng: reqLng,
        });
        matchScore = match.score;
        matchReasons = match.reasons;
      } else {
        // Deterministic default match score
        matchScore = distanceKm !== null && distanceKm <= 3 ? 96 : 92;
        matchReasons = [
          `Neighborhood proximity (${req.neighborhood})`,
          distanceKm !== null ? `${distanceKm} km away` : 'Walking distance',
        ];
      }

      return {
        id: req.id,
        title: req.title,
        description: req.description,
        category: req.category,
        urgency: req.urgency,
        neighborhood: req.neighborhood,
        locationName: req.locationName || `${req.neighborhood}, Mumbai`,
        latitude: req.latitude,
        longitude: req.longitude,
        distanceKm: distanceKm !== null ? distanceKm : undefined,
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

    // Apply radius filtering if radius is provided and reference coords are available
    if (query.radius !== undefined && query.radius > 0 && hasRefCoords) {
      const radiusKm = query.radius;
      results = results.filter((r) => r.distanceKm !== undefined && r.distanceKm <= radiusKm);
    }

    // Sort options
    if (query.sortBy === 'nearest') {
      results.sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (query.sortBy === 'recommended') {
      results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (query.sortBy === 'urgent') {
      const urgencyRank: Record<string, number> = { URGENT: 3, TODAY: 2, FLEXIBLE: 1 };
      results.sort((a, b) => (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0));
    }

    return results;
  }

  static async getById(
    requestId: string,
    currentUser?: { id: string; neighborhood: string; skills: string[]; latitude?: number | null; longitude?: number | null }
  ) {
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
            locationName: true,
            latitude: true,
            longitude: true,
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
                locationName: true,
                latitude: true,
                longitude: true,
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

    const reqLat = req.latitude ?? req.requester.latitude;
    const reqLng = req.longitude ?? req.requester.longitude;
    let distanceKm: number | null = null;

    if (
      currentUser?.latitude !== undefined && currentUser?.latitude !== null &&
      currentUser?.longitude !== undefined && currentUser?.longitude !== null &&
      reqLat !== null && reqLat !== undefined &&
      reqLng !== null && reqLng !== undefined
    ) {
      distanceKm = LocationService.calculateDistanceKm(
        currentUser.latitude,
        currentUser.longitude,
        reqLat,
        reqLng
      );
    }

    let matchScore = 94;
    let matchReasons = [
      `Neighborhood proximity (${req.neighborhood})`,
      'Direct skill match for category',
      'Available within time slot',
    ];

    if (currentUser && currentUser.id !== req.requesterId) {
      const match = NeighborMatchService.calculateMatch({
        userNeighborhood: currentUser.neighborhood,
        userSkills: currentUser.skills || [],
        userLat: currentUser.latitude,
        userLng: currentUser.longitude,
        requestNeighborhood: req.neighborhood,
        requestCategory: req.category,
        requestUrgency: req.urgency as any,
        requestDate: req.preferredDate,
        requestLat: reqLat,
        requestLng: reqLng,
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
      locationName: req.locationName || `${req.neighborhood}, Mumbai`,
      latitude: req.latitude,
      longitude: req.longitude,
      distanceKm: distanceKm !== null ? distanceKm : undefined,
      preferredDate: req.preferredDate,
      preferredTime: req.preferredTime,
      reward: req.reward || undefined,
      status: req.status,
      completionRequestedAt: req.completionRequestedAt ? req.completionRequestedAt.toISOString() : null,
      completionRequestedBy: req.completionRequestedBy,
      completedAt: req.assignment?.completedAt ? req.assignment.completedAt.toISOString() : null,
      matchScore,
      matchReasons,
      requester: req.requester,
      helper: req.assignment?.helper || null,
      reviews: req.reviews.map((r) => ({
        id: r.id,
        requestId: r.requestId,
        reviewerId: r.reviewerId,
        revieweeId: r.revieweeId,
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
    locationName?: string;
    latitude?: number;
    longitude?: number;
    preferredDate: string;
    preferredTime: string;
    reward?: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    // Auto geocode if coordinates are missing
    let locationName = data.locationName || data.neighborhood;
    let latitude = data.latitude ?? null;
    let longitude = data.longitude ?? null;

    if (latitude === null || longitude === null) {
      const geocoded = await LocationService.geocode(locationName);
      if (geocoded) {
        locationName = geocoded.locationName;
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
      } else {
        locationName = data.neighborhood.trim();
      }
    }

    const request = await prisma.helpRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        neighborhood: data.neighborhood,
        locationName,
        latitude,
        longitude,
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
            locationName: true,
            latitude: true,
            longitude: true,
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

    // Notify qualifying nearby / skill-matched neighbors
    try {
      await NotificationService.notifySmartMatchesForRequest(request.id);
    } catch (err) {
      console.error('Failed to dispatch match notifications:', err);
    }

    return request;
  }

  static async update(userId: string, requestId: string, data: any) {
    const req = await prisma.helpRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new AppError('Request not found.', 404);
    if (req.requesterId !== userId) throw new AppError('Only the requester can edit this request.', 403);
    if (req.status !== 'OPEN') throw new AppError('Cannot edit request once it has been accepted.', 400);

    let updateLocationName = data.locationName;
    let updateLat = data.latitude;
    let updateLng = data.longitude;

    if ((data.locationName || data.neighborhood) && (updateLat === undefined || updateLng === undefined)) {
      const geocoded = await LocationService.geocode(data.locationName || data.neighborhood);
      if (geocoded) {
        updateLocationName = geocoded.locationName;
        updateLat = geocoded.latitude;
        updateLng = geocoded.longitude;
      }
    }

    return prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        ...data,
        ...(updateLocationName !== undefined && { locationName: updateLocationName }),
        ...(updateLat !== undefined && { latitude: updateLat }),
        ...(updateLng !== undefined && { longitude: updateLng }),
      },
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
    const helper = await prisma.user.findUnique({ where: { id: helperId } });
    if (!helper) throw new AppError('Helper user account not found.', 404);

    // Atomic transaction for accepting help request and assigning helper
    const [assignment, conversation] = await prisma.$transaction(async (tx) => {
      const currentReq = await tx.helpRequest.findUnique({
        where: { id: requestId },
        include: { requester: true, assignment: true },
      });

      if (!currentReq) {
        throw new AppError('Help request not found.', 404);
      }
      if (currentReq.requesterId === helperId) {
        throw new AppError('You cannot accept your own help request.', 400);
      }
      if (currentReq.status !== 'OPEN' || currentReq.assignment) {
        throw new AppError('This request has already been accepted or closed.', 409);
      }

      // Create Assignment record
      const newAssignment = await tx.assignment.create({
        data: {
          requestId,
          helperId,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      // Create or ensure Conversation exists for private Help Chat
      const newConv = await tx.conversation.upsert({
        where: { requestId },
        update: {},
        create: { requestId },
      });

      // Update HelpRequest status to ACCEPTED
      await tx.helpRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      return [newAssignment, newConv];
    });

    const fullRequest = await RequestService.getById(requestId, {
      id: helperId,
      neighborhood: helper.neighborhood,
      skills: helper.skills,
    });

    // Record community activity feed entry
    await prisma.communityActivity.create({
      data: {
        type: 'HELP_ACCEPTED',
        userName: helper.name,
        targetName: fullRequest.requester.name,
        requestTitle: fullRequest.title,
        timestamp: 'Just now',
      },
    }).catch(() => {});

    // Notify requester that helper accepted
    NotificationService.notifyRequestAccepted(requestId, helperId).catch((err) => {
      console.error('Failed to dispatch accept notification:', err);
    });

    return {
      request: fullRequest,
      assignment,
      conversation,
    };
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

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: { status: 'IN_PROGRESS' },
    });

    // Notify requester that help started
    NotificationService.notifyRequestStarted(requestId, helperId).catch((err) => {
      console.error('Failed to dispatch start notification:', err);
    });

    return RequestService.getById(requestId, {
      id: helperId,
      neighborhood: '',
      skills: [],
    });
  }

  /**
   * Helper marks work done: sets completionRequestedAt without immediately marking completed.
   */
  static async requestCompletion(helperId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.status !== 'IN_PROGRESS') {
      throw new AppError('Request must be IN_PROGRESS to request completion.', 400);
    }
    if (!req.assignment || req.assignment.helperId !== helperId) {
      throw new AppError('Only the assigned helper can mark this help as done.', 403);
    }

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        completionRequestedAt: new Date(),
        completionRequestedBy: helperId,
      },
    });

    // Notify requester that completion was requested
    NotificationService.notifyCompletionRequested(requestId, helperId).catch((err) => {
      console.error('Failed to dispatch completion request notification:', err);
    });

    return RequestService.getById(requestId, {
      id: helperId,
      neighborhood: '',
      skills: [],
    });
  }

  /**
   * Requester confirms completion: sets COMPLETED status, increments completedHelps, and evaluates badges.
   */
  static async confirmCompletion(requesterId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.requesterId !== requesterId) {
      throw new AppError('Only the requester can confirm completion.', 403);
    }
    if (req.status !== 'IN_PROGRESS') {
      throw new AppError('Request must be IN_PROGRESS to confirm completion.', 400);
    }
    if (!req.completionRequestedAt) {
      throw new AppError('The helper must mark the help as done before you can confirm completion.', 400);
    }
    if (!req.assignment) {
      throw new AppError('No assigned helper found for this request.', 400);
    }

    const helperId = req.assignment.helperId;
    const helper = await prisma.user.findUnique({ where: { id: helperId } });
    if (!helper) throw new AppError('Helper not found.', 404);

    // Atomic transaction for safe state transition
    const [, , updatedHelper] = await prisma.$transaction([
      prisma.assignment.update({
        where: { requestId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      }),
      prisma.helpRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      }),
      prisma.user.update({
        where: { id: helperId },
        data: { completedHelps: { increment: 1 } },
      }),
    ]);

    // Evaluate and auto-award badges for helper
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

    // Notify helper that completion was confirmed & trigger rating prompt for both
    NotificationService.notifyRequestCompleted(requestId, requesterId).catch((err) => {
      console.error('Failed to dispatch completion notifications:', err);
    });

    return RequestService.getById(requestId, {
      id: requesterId,
      neighborhood: req.requester.neighborhood,
      skills: [],
    });
  }

  /**
   * Requester rejects / postpones completion confirmation.
   */
  static async rejectCompletion(requesterId: string, requestId: string) {
    const req = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, assignment: true },
    });

    if (!req) throw new AppError('Help request not found.', 404);
    if (req.requesterId !== requesterId) {
      throw new AppError('Only the requester can postpone or reject completion confirmation.', 403);
    }
    if (req.status !== 'IN_PROGRESS') {
      throw new AppError('Request must be IN_PROGRESS.', 400);
    }

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        completionRequestedAt: null,
        completionRequestedBy: null,
      },
    });

    return RequestService.getById(requestId, {
      id: requesterId,
      neighborhood: req.requester.neighborhood,
      skills: [],
    });
  }
}
