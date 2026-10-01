import { apiClient } from './client';
import { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  neighborhood: string;
  bio?: string;
  skills?: string[];
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
  },
};
