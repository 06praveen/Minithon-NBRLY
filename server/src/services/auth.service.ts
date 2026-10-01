import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    neighborhood: string;
    bio?: string;
    skills?: string[];
    avatar?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        neighborhood: data.neighborhood.trim(),
        bio: data.bio || '',
        skills: data.skills || [],
        avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
        rating: 5.0,
        completedHelps: 0,
        createdHelpsCount: 0,
        joinedAt: 'Oct 2026',
      },
      select: {
        id: true,
        name: true,
        email: true,
        neighborhood: true,
        bio: true,
        skills: true,
        avatar: true,
        rating: true,
        completedHelps: true,
        createdHelpsCount: true,
        joinedAt: true,
        createdAt: true,
      },
    });

    // Record activity
    await prisma.communityActivity.create({
      data: {
        type: 'MEMBER_JOINED',
        userName: user.name,
        timestamp: 'Just now',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      neighborhood: user.neighborhood,
      bio: user.bio,
      rating: user.rating,
      completedHelps: user.completedHelps,
      createdHelpsCount: user.createdHelpsCount,
      skills: user.skills,
      joinedAt: user.joinedAt,
    };

    return { user: safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: { badge: true },
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      neighborhood: user.neighborhood,
      bio: user.bio,
      rating: user.rating,
      completedHelps: user.completedHelps,
      createdHelpsCount: user.createdHelpsCount,
      skills: user.skills,
      joinedAt: user.joinedAt,
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        code: ub.badge.code,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt.toISOString().split('T')[0],
      })),
      reviews: user.reviewsReceived.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.comment,
        reviewerName: r.reviewer.name,
        reviewerAvatar: r.reviewer.avatar || undefined,
        date: r.createdAt.toLocaleDateString(),
      })),
    };
  }
}
