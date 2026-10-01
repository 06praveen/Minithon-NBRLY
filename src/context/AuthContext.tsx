import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, RegisterPayload, LoginPayload } from '../api/auth';
import { usersApi } from '../api/users';
import { mockUser } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nbrly_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nbrly_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return mockUser; }
    }
    return mockUser; // Default demo user
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify authentication on boot
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('nbrly_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('nbrly_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Backend unavailable or session expired, preserving active demo session.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen for global 401 unauthorized event
    const handleUnauthorized = () => {
      setToken(null);
      localStorage.removeItem('nbrly_token');
    };

    window.addEventListener('nbrly_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('nbrly_auth_unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('nbrly_token', res.data.token);
        localStorage.setItem('nbrly_user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('nbrly_token', res.data.token);
        localStorage.setItem('nbrly_user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setToken(null);
      localStorage.removeItem('nbrly_token');
      // Set to guest or mock
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updated = await usersApi.updateMyProfile(updates);
      setUser(updated);
      localStorage.setItem('nbrly_user', JSON.stringify(updated));
    } catch (err) {
      // Fallback local update
      setUser((prev) => {
        if (!prev) return null;
        const next = { ...prev, ...updates };
        localStorage.setItem('nbrly_user', JSON.stringify(next));
        return next;
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
