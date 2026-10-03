import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { LocationService } from './location.service.js';

export class UserBadgeService {
  static async evaluateBadges(user: { id: string; completedHelps: number; rating: number }) {
    const allBadges = await prisma.badge.findMany();
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      select: { badgeId: true },
    });
    const earnedIds = new Set(existingBadges.map((b) => b.badgeId));

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      let shouldAward = false;
      if (badge.code === 'FIRST_HELPER' && user.completedHelps >= 1) shouldAward = true;
      if (badge.code === 'COMMUNITY_BUILDER' && user.completedHelps >= 5) shouldAward = true;
      if (badge.code === 'QUICK_RESPONDER' && user.completedHelps >= 1) shouldAward = true;
      if (badge.code === 'TEN_HELPS' && user.completedHelps >= 10) shouldAward = true;
      if (badge.code === 'NEIGHBORHOOD_STAR' && user.rating >= 4.8 && user.completedHelps >= 10) shouldAward = true;

      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
          },
        });
      }
    }
  }
}

export class UserService {
  static async getPublicProfile(userId: string) {
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
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      neighborhood: user.neighborhood,
      locationName: user.locationName || `${user.neighborhood}, Mumbai`,
      latitude: user.latitude,
      longitude: user.longitude,
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

  static async updateProfile(userId: string, data: {
    name?: string;
    bio?: string;
    neighborhood?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    skills?: string[];
    avatar?: string;
  }) {
    let updateLocationName: string | undefined = undefined;
    let updateLat: number | undefined = data.latitude;
    let updateLng: number | undefined = data.longitude;

    // If location or neighborhood is provided, geocode to ensure complete alignment
    const locQuery = (data.locationName || data.neighborhood || '').trim();
    if (locQuery) {
      const geocoded = await LocationService.geocode(locQuery);
      if (!geocoded) {
        throw new AppError("Couldn't find that location. Try entering a nearby area or neighborhood.", 400);
      }
      updateLocationName = geocoded.locationName;
      updateLat = geocoded.latitude;
      updateLng = geocoded.longitude;
    }

    // Only allow updating safe fields
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.bio !== undefined && { bio: data.bio.trim() }),
        ...(updateLocationName !== undefined
          ? {
              neighborhood: updateLocationName,
              locationName: updateLocationName,
              latitude: updateLat,
              longitude: updateLng,
            }
          : {
              ...(data.neighborhood && { neighborhood: data.neighborhood.trim() }),
              ...(data.locationName && { locationName: data.locationName.trim() }),
              ...(updateLat !== undefined && { latitude: updateLat }),
              ...(updateLng !== undefined && { longitude: updateLng }),
            }),
        ...(data.skills && { skills: data.skills }),
        ...(data.avatar && { avatar: data.avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        neighborhood: true,
        locationName: true,
        latitude: true,
        longitude: true,
        bio: true,
        rating: true,
        completedHelps: true,
        createdHelpsCount: true,
        skills: true,
        joinedAt: true,
      },
    });

    return updated;
  }
}
