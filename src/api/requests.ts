import { apiClient } from './client';
import { HelpRequest } from '../types';

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: string;
  urgency: 'URGENT' | 'TODAY' | 'FLEXIBLE';
  neighborhood: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  preferredDate: string;
  preferredTime: string;
  reward?: string;
}

export interface RequestFilterParams {
  search?: string;
  category?: string;
  urgency?: string;
  neighborhood?: string;
  status?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: 'nearest' | 'recommended' | 'urgent' | 'newest';
}

export const requestsApi = {
  async list(params?: RequestFilterParams): Promise<HelpRequest[]> {
    const res = await apiClient.get<{ success: boolean; data: { requests: HelpRequest[] } }>('/requests', {
      params,
    });
    return res.data.data.requests;
  },

  async getById(id: string): Promise<HelpRequest> {
    const res = await apiClient.get<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}`);
    return res.data.data.request;
  },

  async create(payload: CreateRequestPayload): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>('/requests', payload);
    return res.data.data.request;
  },

  async update(id: string, payload: Partial<CreateRequestPayload>): Promise<HelpRequest> {
    const res = await apiClient.patch<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}`, payload);
    return res.data.data.request;
  },

  async cancel(id: string): Promise<HelpRequest> {
    const res = await apiClient.delete<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}`);
    return res.data.data.request;
  },

  async accept(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/accept`);
    return res.data.data.request;
  },

  async start(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/start`);
    return res.data.data.request;
  },

  async requestCompletion(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/request-completion`);
    return res.data.data.request;
  },

  async confirmCompletion(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/confirm-completion`);
    return res.data.data.request;
  },

  async rejectCompletion(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/reject-completion`);
    return res.data.data.request;
  },

  async complete(id: string): Promise<HelpRequest> {
    const res = await apiClient.post<{ success: boolean; data: { request: HelpRequest } }>(`/requests/${id}/confirm-completion`);
    return res.data.data.request;
  },

  async getChat(requestId: string): Promise<{ conversation: any; messages: any[] }> {
    const res = await apiClient.get<{ success: boolean; data: { conversation: any; messages: any[] } }>(`/requests/${requestId}/chat`);
    return res.data.data;
  },

  async sendMessage(requestId: string, content: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: { message: any } }>(`/requests/${requestId}/chat/messages`, { content });
    return res.data.data.message;
  },

  async getReviews(requestId: string): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: { reviews: any[] } }>(`/requests/${requestId}/reviews`);
    return res.data.data.reviews;
  },

  async review(id: string, rating: number, comment: string): Promise<any> {
    const res = await apiClient.post(`/requests/${id}/reviews`, { rating, comment });
    return res.data.data;
  },
};
