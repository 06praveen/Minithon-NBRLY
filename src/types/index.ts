export type Category = 
  | 'Healthcare / Medicine'
  | 'Grocery / Errands'
  | 'Education'
  | 'Technology'
  | 'Transport'
  | 'Household'
  | 'Elderly Assistance'
  | 'Other';

export type Urgency = 'URGENT' | 'TODAY' | 'FLEXIBLE';

export type RequestStatus = 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  reviewerName: string;
  reviewerAvatar?: string;
  date: string;
}

export interface CommunityActivity {
  id: string;
  type: 'HELP_COMPLETED' | 'HELP_ACCEPTED' | 'REQUEST_CREATED' | 'MEMBER_JOINED';
  userName: string;
  targetName?: string;
  requestTitle?: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  neighborhood: string;
  bio: string;
  rating: number;
  completedHelps: number;
  createdHelpsCount: number;
  skills: string[];
  badges: Badge[];
  joinedAt: string;
  reviews?: Review[];
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: Category;
  urgency: Urgency;
  neighborhood: string;
  preferredDate: string;
  preferredTime: string;
  reward?: string;
  status: RequestStatus;
  matchScore?: number;
  matchReasons?: string[];
  requester: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedHelps: number;
    neighborhood: string;
  };
  createdAt: string;
}

export interface Activity {
  id: string;
  requestId: string;
  requestTitle: string;
  category: Category;
  urgency: Urgency;
  neighborhood: string;
  role: 'created' | 'helping';
  status: RequestStatus;
  updatedAt: string;
  otherPartyName: string;
}

export interface NeighborhoodStats {
  neighborhoodName: string;
  activeRequests: number;
  activeHelpers: number;
  completedHelps: number;
  topCategory: string;
}
