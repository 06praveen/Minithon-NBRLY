import { prisma } from '../config/db.js';
import { NeighborMatchService } from './neighborMatch.service.js';
import { LocationService } from './location.service.js';

export type NotificationTab = 'all' | 'requests' | 'messages' | 'matches';

export class NotificationService {
  /**
   * Helper to create a single notification safely without duplicate unread spam.
   */
  static async createNotification(data: {
    userId: string;
    type:
      | 'MATCH'
      | 'REQUEST_ACCEPTED'
      | 'NEW_MESSAGE'
      | 'REQUEST_STARTED'
      | 'COMPLETION_REQUESTED'
      | 'REQUEST_COMPLETED'
      | 'REVIEW_AVAILABLE';
    title: string;
    message: string;
    requestId?: string | null;
    conversationId?: string | null;
    actorId?: string | null;
    matchScore?: number | null;
    distanceKm?: number | null;
    urgency?: 'URGENT' | 'TODAY' | 'FLEXIBLE' | null;
  }) {
    // Avoid notifying oneself
    if (data.actorId && data.actorId === data.userId) {
      return null;
    }

    // Deduplicate identical unread notifications for the same user, type, and request
    if (data.requestId && data.type !== 'NEW_MESSAGE') {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: data.userId,
          type: data.type,
          requestId: data.requestId,
          read: false,
        },
      });
      if (existing) {
        return existing;
      }
    }

    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        requestId: data.requestId || null,
        conversationId: data.conversationId || null,
        actorId: data.actorId || null,
        matchScore: data.matchScore ?? null,
        distanceKm: data.distanceKm !== undefined && data.distanceKm !== null ? Math.round(data.distanceKm * 10) / 10 : null,
        urgency: data.urgency || null,
      },
    });
  }

  /**
   * Evaluate potential recipient neighbors for a newly created help request.
   * Condition A: Distance <= 10 km OR Condition B: NeighborMatch >= 80%.
   */
  static async notifySmartMatchesForRequest(requestId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true },
    });

    if (!request || request.status !== 'OPEN') return;

    // Retrieve potential candidate users (excluding requester)
    const candidates = await prisma.user.findMany({
      where: {
        id: { not: request.requesterId },
      },
      select: {
        id: true,
        name: true,
        neighborhood: true,
        skills: true,
        latitude: true,
        longitude: true,
      },
    });

    for (const candidate of candidates) {
      // Calculate geographic distance
      let distanceKm: number | null = null;
      if (
        request.latitude !== null &&
        request.longitude !== null &&
        candidate.latitude !== null &&
        candidate.longitude !== null
      ) {
        distanceKm = LocationService.calculateDistance(
          candidate.latitude,
          candidate.longitude,
          request.latitude,
          request.longitude
        );
      }

      // Calculate NeighborMatch score
      const match = NeighborMatchService.calculateMatch({
        userNeighborhood: candidate.neighborhood || '',
        userSkills: Array.isArray(candidate.skills) ? candidate.skills : [],
        userLat: candidate.latitude,
        userLng: candidate.longitude,
        requestNeighborhood: request.neighborhood,
        requestCategory: request.category,
        requestUrgency: request.urgency as 'URGENT' | 'TODAY' | 'FLEXIBLE',
        requestDate: request.preferredDate || 'Flexible',
        requestLat: request.latitude,
        requestLng: request.longitude,
      });

      const qualifiesDistance = distanceKm !== null && distanceKm <= 10;
      const qualifiesScore = match.score >= 80;

      if (qualifiesDistance || qualifiesScore) {
        const distStr = distanceKm !== null ? `${distanceKm.toFixed(1)} km away` : `${request.neighborhood}`;
        const isUrgent = request.urgency === 'URGENT';
        const title = isUrgent ? '🔴 URGENT HELP NEAR YOU' : 'New help request near you';
        const message = `${request.title} — ${distStr} · ${match.score}% match`;

        await this.createNotification({
          userId: candidate.id,
          type: 'MATCH',
          title,
          message,
          requestId: request.id,
          actorId: request.requesterId,
          matchScore: match.score,
          distanceKm: distanceKm ?? undefined,
          urgency: request.urgency,
        });
      }
    }
  }

  /**
   * Notify requester when a neighbor accepts their request.
   */
  static async notifyRequestAccepted(requestId: string, helperId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { requester: true },
    });
    const helper = await prisma.user.findUnique({ where: { id: helperId } });

    if (!request || !helper) return;

    await this.createNotification({
      userId: request.requesterId,
      type: 'REQUEST_ACCEPTED',
      title: `${helper.name} accepted your request`,
      message: `${helper.name} accepted "${request.title}". Coordinate details in Help Chat.`,
      requestId: request.id,
      actorId: helper.id,
    });
  }

  /**
   * Notify other participant when a chat message is sent.
   */
  static async notifyNewMessage(requestId: string, senderId: string, content: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });

    if (!request) return;

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) return;

    const helperId = request.assignment?.helperId;
    let recipientId: string | null = null;

    if (senderId === request.requesterId) {
      recipientId = helperId || null;
    } else if (senderId === helperId) {
      recipientId = request.requesterId;
    }

    if (!recipientId) return;

    const snippet = content.length > 50 ? `${content.slice(0, 47)}...` : content;

    await this.createNotification({
      userId: recipientId,
      type: 'NEW_MESSAGE',
      title: `New message from ${sender.name}`,
      message: `"${snippet}"`,
      requestId: request.id,
      actorId: sender.id,
    });
  }

  /**
   * Notify requester when helper starts the task.
   */
  static async notifyRequestStarted(requestId: string, helperId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
    });
    const helper = await prisma.user.findUnique({ where: { id: helperId } });

    if (!request || !helper) return;

    await this.createNotification({
      userId: request.requesterId,
      type: 'REQUEST_STARTED',
      title: 'Help in progress',
      message: `${helper.name} started helping with "${request.title}".`,
      requestId: request.id,
      actorId: helper.id,
    });
  }

  /**
   * Notify requester when helper requests completion.
   */
  static async notifyCompletionRequested(requestId: string, helperId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
    });
    const helper = await prisma.user.findUnique({ where: { id: helperId } });

    if (!request || !helper) return;

    await this.createNotification({
      userId: request.requesterId,
      type: 'COMPLETION_REQUESTED',
      title: 'Help marked as done',
      message: `${helper.name} marked "${request.title}" as completed. Please confirm completion.`,
      requestId: request.id,
      actorId: helper.id,
    });
  }

  /**
   * Notify helper when requester confirms completion & trigger rating notification for both.
   */
  static async notifyRequestCompleted(requestId: string, requesterId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        assignment: { include: { helper: true } },
      },
    });

    if (!request || !request.assignment) return;

    const helperId = request.assignment.helperId;

    // 1. Notify helper that requester confirmed
    await this.createNotification({
      userId: helperId,
      type: 'REQUEST_COMPLETED',
      title: 'Help confirmed completed',
      message: `${request.requester.name} confirmed that "${request.title}" was completed!`,
      requestId: request.id,
      actorId: requesterId,
    });

    // 2. Notify requester to review helper
    await this.createNotification({
      userId: requesterId,
      type: 'REVIEW_AVAILABLE',
      title: 'Rate your helper',
      message: `How was your experience with ${request.assignment.helper.name}? Leave a review.`,
      requestId: request.id,
      actorId: helperId,
    });

    // 3. Notify helper to review requester
    await this.createNotification({
      userId: helperId,
      type: 'REVIEW_AVAILABLE',
      title: 'Rate your requester',
      message: `How was your experience helping ${request.requester.name}? Leave a review.`,
      requestId: request.id,
      actorId: requesterId,
    });
  }

  /**
   * Resolve / mark review notification as read once submitted.
   */
  static async resolveReviewNotification(userId: string, requestId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        requestId,
        type: 'REVIEW_AVAILABLE',
      },
      data: { read: true },
    });
  }

  /**
   * Fetch all notifications for a user with optional tab filter.
   */
  static async getNotifications(userId: string, tab: NotificationTab = 'all') {
    const where: any = { userId };

    if (tab === 'requests') {
      where.type = {
        in: [
          'REQUEST_ACCEPTED',
          'REQUEST_STARTED',
          'COMPLETION_REQUESTED',
          'REQUEST_COMPLETED',
          'REVIEW_AVAILABLE',
        ],
      };
    } else if (tab === 'messages') {
      where.type = 'NEW_MESSAGE';
    } else if (tab === 'matches') {
      where.type = 'MATCH';
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, avatar: true, neighborhood: true },
        },
        request: {
          select: {
            id: true,
            title: true,
            category: true,
            urgency: true,
            status: true,
            neighborhood: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      requestId: n.requestId,
      conversationId: n.conversationId,
      actorId: n.actorId,
      actor: n.actor,
      request: n.request,
      read: n.read,
      matchScore: n.matchScore,
      distanceKm: n.distanceKm,
      urgency: n.urgency,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));
  }

  /**
   * Get total unread count for navbar badge.
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(userId: string, notificationId: string) {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif || notif.userId !== userId) {
      return null;
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Get active help conversations for the Messages tab in Inbox.
   */
  static async getConversationsSummary(userId: string) {
    // Find all help requests where user is requester or assigned helper
    const requestsWithConversations = await prisma.helpRequest.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { assignment: { helperId: userId } },
        ],
        conversation: { isNot: null },
      },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true, neighborhood: true },
        },
        assignment: {
          include: {
            helper: {
              select: { id: true, name: true, avatar: true, neighborhood: true },
            },
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return requestsWithConversations
      .filter((r) => r.conversation)
      .map((r) => {
        const isRequester = r.requesterId === userId;
        const otherParty = isRequester ? r.assignment?.helper : r.requester;
        const lastMessage = r.conversation?.messages[0] || null;

        return {
          id: r.conversation!.id,
          requestId: r.id,
          requestTitle: r.title,
          category: r.category,
          status: r.status,
          otherParty: otherParty || { id: '', name: 'Neighbor', avatar: null, neighborhood: r.neighborhood },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                senderName: lastMessage.sender.name,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          updatedAt: (lastMessage?.createdAt || r.conversation!.updatedAt).toISOString(),
        };
      });
  }
}
