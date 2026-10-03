import { apiClient } from './client';
import { AppNotification, ConversationSummary } from '../types';

export const notificationsApi = {
  async list(tab?: 'all' | 'requests' | 'messages' | 'matches'): Promise<AppNotification[]> {
    const res = await apiClient.get<{ success: boolean; data: { notifications: AppNotification[] } }>('/notifications', {
      params: tab && tab !== 'all' ? { tab } : undefined,
    });
    return res.data.data.notifications;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const res = await apiClient.patch<{ success: boolean; data: { notification: AppNotification } }>(`/notifications/${id}/read`);
    return res.data.data.notification;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async getConversations(): Promise<ConversationSummary[]> {
    const res = await apiClient.get<{ success: boolean; data: { conversations: ConversationSummary[] } }>('/notifications/conversations');
    return res.data.data.conversations;
  },
};
