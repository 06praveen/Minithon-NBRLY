import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  recentNotifications: AppNotification[];
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem('nbrly_token');
    if (!token || !user) {
      setUnreadCount(0);
      setRecentNotifications([]);
      return;
    }

    try {
      setIsLoading(true);
      const [count, list] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.list('all'),
      ]);
      setUnreadCount(count);
      setRecentNotifications(list.slice(0, 5));
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Polling unread count and recent notifications every 7 seconds while authenticated
  useEffect(() => {
    const token = localStorage.getItem('nbrly_token');
    if (!token || !user) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 7000);

    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        recentNotifications,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
