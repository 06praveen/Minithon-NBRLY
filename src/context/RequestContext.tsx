import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HelpRequest, Activity, User, RequestStatus, Category, Urgency, CommunityActivity, Badge } from '../types';
import { loadStoredRequests, saveStoredRequests, loadStoredActivities, saveStoredActivities, loadStoredUser, saveStoredUser } from '../utils/storage';
import { mockUser, mockCommunityActivity, BADGE_DEFINITIONS } from '../data/mockData';
import { requestsApi } from '../api/requests';
import { communityApi } from '../api/community';
import { activityApi } from '../api/activity';
import { useAuth } from './AuthContext';

export const DEMO_USERS: User[] = [
  mockUser, // Aarav Sharma - Bandra West
  {
    id: 'usr_03',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    neighborhood: 'Bandra West',
    bio: 'Avid volunteer and tech enthusiast in Pali Hill.',
    rating: 4.9,
    completedHelps: 18,
    createdHelpsCount: 2,
    skills: ['Technology', 'Grocery / Errands', 'Healthcare'],
    badges: [],
    joinedAt: 'Jul 2026',
  },
  {
    id: 'usr_04',
    name: 'Priya Shah',
    email: 'priya.shah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    neighborhood: 'Bandra West',
    bio: 'Educator and community organizer.',
    rating: 5.0,
    completedHelps: 12,
    createdHelpsCount: 5,
    skills: ['Education', 'Household'],
    badges: [],
    joinedAt: 'Jun 2026',
  },
];

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

// Calculate badges based on user stats
function calculateBadges(user: User): Badge[] {
  const earned: Badge[] = [];
  const now = new Date().toISOString().split('T')[0];

  for (const def of BADGE_DEFINITIONS) {
    let isEarned = false;
    switch (def.id) {
      case 'bdg_01': // FIRST HELPER
        isEarned = user.completedHelps >= 1;
        break;
      case 'bdg_02': // COMMUNITY BUILDER
        isEarned = user.completedHelps >= 5;
        break;
      case 'bdg_03': // QUICK RESPONDER
        isEarned = user.completedHelps >= 1;
        break;
      case 'bdg_04': // 10 HELPS COMPLETED
        isEarned = user.completedHelps >= 10;
        break;
      case 'bdg_05': // NEIGHBORHOOD STAR
        isEarned = user.rating >= 4.8 && user.completedHelps >= 10;
        break;
    }

    const existing = user.badges?.find((b) => b.id === def.id);
    if (isEarned) {
      earned.push({
        ...def,
        earnedAt: existing?.earnedAt || now,
      });
    }
  }

  return earned;
}

interface RequestContextType {
  requests: HelpRequest[];
  activities: Activity[];
  currentUser: User;
  communityActivity: CommunityActivity[];
  toast: ToastMessage | null;
  createRequest: (data: {
    title: string;
    description: string;
    category: Category;
    urgency: Urgency;
    neighborhood: string;
    preferredDate: string;
    preferredTime: string;
    reward?: string;
  }) => Promise<HelpRequest>;
  acceptRequest: (requestId: string) => Promise<void>;
  startRequest: (requestId: string) => Promise<void>;
  completeRequest: (requestId: string, rating?: number, review?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  switchUser: (userId: string) => void;
  clearToast: () => void;
  getUserById: (userId: string) => User | undefined;
  refreshAll: () => Promise<void>;
  stats: {
    openRequests: number;
    activeHelpers: number;
    completedHelps: number;
    activeCategories: number;
    mostRequestedCategory: string;
    mostActiveCategory: string;
    peakTime: string;
  };
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  const [requests, setRequests] = useState<HelpRequest[]>(loadStoredRequests);
  const [activities, setActivities] = useState<Activity[]>(loadStoredActivities);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = loadStoredUser();
    return { ...saved, badges: calculateBadges(saved) };
  });

  const [communityActivity, setCommunityActivity] = useState<CommunityActivity[]>(mockCommunityActivity);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync auth context user when changed
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
      saveStoredUser(authUser);
    }
  }, [authUser]);

  // Initial backend sync on load
  const refreshAll = useCallback(async () => {
    try {
      // 1. Fetch live requests from API
      const liveRequests = await requestsApi.list();
      if (liveRequests && liveRequests.length > 0) {
        setRequests(liveRequests);
        saveStoredRequests(liveRequests);
      }

      // 2. Fetch live community activity
      const liveCommunity = await communityApi.getActivityFeed();
      if (liveCommunity && liveCommunity.length > 0) {
        setCommunityActivity(liveCommunity);
      }

      // 3. Fetch live user activity if authenticated
      if (localStorage.getItem('nbrly_token')) {
        const liveUserActivities = await activityApi.getMyActivity();
        if (liveUserActivities && liveUserActivities.length > 0) {
          setActivities(liveUserActivities);
          saveStoredActivities(liveUserActivities);
        }
      }
    } catch {
      // Gracefully fall back to stored localStorage/mock state
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Save requests and activities to localStorage whenever they change
  useEffect(() => {
    saveStoredRequests(requests);
  }, [requests]);

  useEffect(() => {
    saveStoredActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveStoredUser(currentUser);
  }, [currentUser]);

  // Auto-recalculate badges when completedHelps or rating changes
  useEffect(() => {
    const calculated = calculateBadges(currentUser);
    if (JSON.stringify(calculated) !== JSON.stringify(currentUser.badges)) {
      setCurrentUser((prev) => ({ ...prev, badges: calculated }));
    }
  }, [currentUser.completedHelps, currentUser.rating]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  };

  const clearToast = () => setToast(null);

  const switchUser = (userId: string) => {
    const target = DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];
    const withBadges = { ...target, badges: calculateBadges(target) };
    setCurrentUser(withBadges);
    showToast(`Switched demo account to ${target.name} (${target.neighborhood})`, 'info');
  };

  const updateUser = useCallback((updates: Partial<User>) => {
    setCurrentUser((prev) => {
      const sanitized = { ...updates };
      delete (sanitized as any).rating;
      delete (sanitized as any).completedHelps;
      delete (sanitized as any).badges;
      return { ...prev, ...sanitized };
    });
    showToast('Profile updated successfully.', 'success');
  }, []);

  const getUserById = useCallback((userId: string): User | undefined => {
    if (currentUser.id === userId) return currentUser;
    return DEMO_USERS.find((u) => u.id === userId);
  }, [currentUser]);

  const addCommunityEvent = (event: Omit<CommunityActivity, 'id'>) => {
    const newEvent: CommunityActivity = {
      id: `ev_${Date.now()}`,
      ...event,
    };
    setCommunityActivity((prev) => [newEvent, ...prev]);
  };

  // ─── Help Request Lifecycle Actions ───

  const createRequest = async (data: {
    title: string;
    description: string;
    category: Category;
    urgency: Urgency;
    neighborhood: string;
    preferredDate: string;
    preferredTime: string;
    reward?: string;
  }): Promise<HelpRequest> => {
    let newRequest: HelpRequest;

    try {
      newRequest = await requestsApi.create(data);
    } catch {
      // Local optimistic fallback
      newRequest = {
        id: `req_${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        neighborhood: data.neighborhood,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        reward: data.reward,
        status: 'OPEN',
        matchScore: 92,
        matchReasons: ['Same neighborhood', 'Proximity score (< 800m)'],
        requester: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          rating: currentUser.rating,
          completedHelps: currentUser.completedHelps,
          neighborhood: currentUser.neighborhood,
        },
        createdAt: new Date().toISOString(),
      };
    }

    setRequests((prev) => [newRequest, ...prev]);

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      requestId: newRequest.id,
      requestTitle: newRequest.title,
      category: newRequest.category,
      urgency: newRequest.urgency,
      neighborhood: newRequest.neighborhood,
      role: 'created',
      status: 'OPEN',
      updatedAt: 'Just now',
      otherPartyName: 'Awaiting neighbor',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setCurrentUser((prev) => ({ ...prev, createdHelpsCount: prev.createdHelpsCount + 1 }));

    addCommunityEvent({
      type: 'REQUEST_CREATED',
      userName: currentUser.name,
      requestTitle: newRequest.title,
      timestamp: 'Just now',
    });

    showToast('Your help request has been published to the neighborhood.', 'success');
    return newRequest;
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await requestsApi.accept(requestId);
    } catch {
      // continue with optimistic update
    }

    const targetReq = requests.find((r) => r.id === requestId);

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'ACCEPTED' as RequestStatus } : req))
    );

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      requestId,
      requestTitle: targetReq?.title || 'Help Request',
      category: targetReq?.category || 'Healthcare / Medicine',
      urgency: targetReq?.urgency || 'TODAY',
      neighborhood: targetReq?.neighborhood || currentUser.neighborhood,
      role: 'helping',
      status: 'ACCEPTED',
      updatedAt: 'Just now',
      otherPartyName: targetReq?.requester.name || 'Neighbor',
    };

    setActivities((prev) => [newActivity, ...prev.filter((a) => a.requestId !== requestId)]);

    addCommunityEvent({
      type: 'HELP_ACCEPTED',
      userName: currentUser.name,
      targetName: targetReq?.requester.name,
      requestTitle: targetReq?.title,
      timestamp: 'Just now',
    });

    showToast(`You accepted to help with: ${targetReq?.title || 'Request'}`, 'success');
  };

  const startRequest = async (requestId: string) => {
    try {
      await requestsApi.start(requestId);
    } catch {
      // continue with optimistic update
    }

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'IN_PROGRESS' as RequestStatus } : req))
    );

    setActivities((prev) =>
      prev.map((act) =>
        act.requestId === requestId ? { ...act, status: 'IN_PROGRESS' as RequestStatus, updatedAt: 'Just now' } : act
      )
    );

    showToast(`Task started! Status is now IN PROGRESS.`, 'info');
  };

  const completeRequest = async (requestId: string, rating?: number, review?: string) => {
    try {
      await requestsApi.complete(requestId);
      if (rating && review) {
        await requestsApi.review(requestId, rating, review);
      }
    } catch {
      // continue with optimistic update
    }

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'COMPLETED' as RequestStatus } : req))
    );

    setActivities((prev) =>
      prev.map((act) =>
        act.requestId === requestId ? { ...act, status: 'COMPLETED' as RequestStatus, updatedAt: 'Just now' } : act
      )
    );

    const req = requests.find((r) => r.id === requestId);
    setCurrentUser((prev) => ({ ...prev, completedHelps: prev.completedHelps + 1 }));

    addCommunityEvent({
      type: 'HELP_COMPLETED',
      userName: currentUser.name,
      targetName: req?.requester.name,
      requestTitle: req?.title,
      timestamp: 'Just now',
    });

    if (review && rating) {
      const newReview: any = {
        id: `rev_${Date.now()}`,
        reviewerName: currentUser.name,
        reviewerAvatar: currentUser.avatar,
        rating,
        text: review,
        date: 'Just now',
      };
      setCurrentUser((prev) => ({
        ...prev,
        reviews: [newReview, ...(prev.reviews || [])],
      }));
    }

    showToast(`Nice one! Task marked COMPLETED.${rating ? ` ${rating}★ review submitted.` : ''}`, 'success');
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await requestsApi.cancel(requestId);
    } catch {
      // continue with optimistic update
    }

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'CANCELLED' as RequestStatus } : req))
    );

    setActivities((prev) =>
      prev.map((act) =>
        act.requestId === requestId ? { ...act, status: 'CANCELLED' as RequestStatus, updatedAt: 'Just now' } : act
      )
    );

    showToast(`Help request has been CANCELLED.`, 'warning');
  };

  // Derived statistics for Neighborhood Pulse
  const categoryCounts: Record<string, number> = {};
  requests.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);

  const stats = {
    openRequests: requests.filter((r) => r.status === 'OPEN').length,
    activeHelpers: activities.filter((a) => a.role === 'helping' && a.status !== 'COMPLETED').length + 8,
    completedHelps: requests.filter((r) => r.status === 'COMPLETED').length + 32,
    activeCategories: new Set(requests.map((r) => r.category)).size,
    mostRequestedCategory: sortedCategories[0]?.[0] || 'Healthcare / Medicine',
    mostActiveCategory: sortedCategories[1]?.[0] || 'Technology',
    peakTime: '6 PM – 8 PM',
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        activities,
        currentUser,
        communityActivity,
        toast,
        createRequest,
        acceptRequest,
        startRequest,
        completeRequest,
        cancelRequest,
        updateUser,
        switchUser,
        clearToast,
        getUserById,
        refreshAll,
        stats,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
