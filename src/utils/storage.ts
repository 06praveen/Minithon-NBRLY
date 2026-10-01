import { HelpRequest, Activity, User } from '../types';
import { mockRequests, mockActivities, mockUser } from '../data/mockData';

const REQUESTS_KEY = 'nbrly_requests';
const ACTIVITIES_KEY = 'nbrly_activities';
const USER_KEY = 'nbrly_user';

export const loadStoredRequests = (): HelpRequest[] => {
  try {
    const saved = localStorage.getItem(REQUESTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load stored requests', e);
  }
  return mockRequests;
};

export const saveStoredRequests = (requests: HelpRequest[]): void => {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save requests', e);
  }
};

export const loadStoredActivities = (): Activity[] => {
  try {
    const saved = localStorage.getItem(ACTIVITIES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load stored activities', e);
  }
  return mockActivities;
};

export const saveStoredActivities = (activities: Activity[]): void => {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
};

export const loadStoredUser = (): User => {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user', e);
  }
  return mockUser;
};

export const saveStoredUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};
