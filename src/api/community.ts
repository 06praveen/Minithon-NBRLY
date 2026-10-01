import { apiClient } from './client';
import { CommunityActivity } from '../types';

export interface CommunityStatsResponse {
  openRequests: number;
  activeHelpers: number;
  completedHelps: number;
  activeCategories: number;
  mostRequestedCategory: string;
  mostActiveCategory: string;
  peakTime: string;
  recentlyCompleted: Array<{ id: string; title: string; category: string }>;
}

export const communityApi = {
  async getStats(): Promise<CommunityStatsResponse> {
    const res = await apiClient.get<{ success: boolean; data: { stats: CommunityStatsResponse } }>('/community/stats');
    return res.data.data.stats;
  },

  async getActivityFeed(): Promise<CommunityActivity[]> {
    const res = await apiClient.get<{ success: boolean; data: { activities: CommunityActivity[] } }>('/community/activity');
    return res.data.data.activities;
  },
};
