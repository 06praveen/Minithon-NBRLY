import { apiClient } from './client';
import { User } from '../types';

export const usersApi = {
  async getPublicProfile(id: string): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: { user: User } }>(`/users/${id}`);
    return res.data.data.user;
  },

  async updateMyProfile(updates: Partial<User>): Promise<User> {
    const res = await apiClient.patch<{ success: boolean; data: { user: User } }>('/users/me', updates);
    return res.data.data.user;
  },
};
