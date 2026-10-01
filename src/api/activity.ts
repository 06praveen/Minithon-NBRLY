import { apiClient } from './client';
import { Activity } from '../types';

export const activityApi = {
  async getMyActivity(): Promise<Activity[]> {
    const res = await apiClient.get<{ success: boolean; data: { activities: Activity[] } }>('/activity/me');
    return res.data.data.activities;
  },
};
