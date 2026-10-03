import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NotificationService } from './notification.service.js';

export class ChatService {
  /**
   * Fetch conversation and message history for an accepted help request.
   * Access is strictly restricted to the requester and the assigned helper.
   */
  static async getChat(requestId: string, userId: string) {
    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true },
        },
        assignment: {
          include: {
            helper: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!helpRequest) {
      throw new AppError('Help request not found.', 404);
    }

    const isRequester = helpRequest.requesterId === userId;
    const isHelper = helpRequest.assignment?.helperId === userId;

    if (!isRequester && !isHelper) {
      throw new AppError('Forbidden. You do not have permission to access this private help chat.', 403);
    }

    // Get or create conversation for this request
    let conversation = await prisma.conversation.findUnique({
      where: { requestId },
      include: {
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { requestId },
        include: {
          messages: {
            include: {
              sender: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return {
      conversation: {
        id: conversation.id,
        requestId: helpRequest.id,
        requestTitle: helpRequest.title,
        status: helpRequest.status,
        requester: helpRequest.requester,
        helper: helpRequest.assignment?.helper || null,
        createdAt: conversation.createdAt.toISOString(),
      },
      messages: conversation.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderAvatar: m.sender.avatar,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Send a chat message within a request conversation.
   * Only the requester or assigned helper can post.
   */
  static async sendMessage(requestId: string, userId: string, rawContent: string) {
    if (!rawContent || typeof rawContent !== 'string') {
      throw new AppError('Message content is required.', 400);
    }

    const content = rawContent.trim();
    if (content.length === 0) {
      throw new AppError('Message cannot be empty.', 400);
    }

    if (content.length > 1000) {
      throw new AppError('Message exceeds maximum length of 1000 characters.', 400);
    }

    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: {
        assignment: true,
      },
    });

    if (!helpRequest) {
      throw new AppError('Help request not found.', 404);
    }

    const isRequester = helpRequest.requesterId === userId;
    const isHelper = helpRequest.assignment?.helperId === userId;

    if (!isRequester && !isHelper) {
      throw new AppError('Forbidden. You cannot send messages in this private conversation.', 403);
    }

    // Ensure conversation exists
    let conversation = await prisma.conversation.findUnique({
      where: { requestId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { requestId },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Touch conversation updated timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Notify recipient of new message
    NotificationService.notifyNewMessage(requestId, userId, content).catch((err) => {
      console.error('Failed to dispatch message notification:', err);
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
