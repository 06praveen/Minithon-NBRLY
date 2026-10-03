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
  requestId?: string;
  reviewerId?: string;
  revieweeId?: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  revieweeName?: string;
  rating: number;
  comment?: string;
  text?: string;
  date?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  requestId: string;
  requestTitle: string;
  status: RequestStatus;
  requester: { id: string; name: string; avatar?: string };
  helper: { id: string; name: string; avatar?: string } | null;
  createdAt: string;
}

export interface ChatData {
  conversation: ChatConversation;
  messages: ChatMessage[];
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
  locationName?: string;
  latitude?: number;
  longitude?: number;
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
  locationName?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  preferredDate: string;
  preferredTime: string;
  reward?: string;
  status: RequestStatus;
  completionRequestedAt?: string | null;
  completionRequestedBy?: string | null;
  matchScore?: number;
  matchReasons?: string[];
  requester: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedHelps: number;
    neighborhood: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  helper?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedHelps: number;
    neighborhood: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  reviews?: Review[];
  createdAt: string;
}

export interface Activity {
  id: string;
  requestId: string;
  requestTitle: string;
  category: Category;
  urgency: Urgency;
  neighborhood: string;
  locationName?: string;
  distanceKm?: number;
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

export type NotificationType =
  | 'MATCH'
  | 'REQUEST_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'REQUEST_STARTED'
  | 'COMPLETION_REQUESTED'
  | 'REQUEST_COMPLETED'
  | 'REVIEW_AVAILABLE';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: string | null;
  conversationId?: string | null;
  actorId?: string | null;
  actor?: { id: string; name: string; avatar?: string; neighborhood?: string } | null;
  request?: {
    id: string;
    title: string;
    category: Category;
    urgency: Urgency;
    status: RequestStatus;
    neighborhood: string;
  } | null;
  read: boolean;
  matchScore?: number | null;
  distanceKm?: number | null;
  urgency?: Urgency | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationSummary {
  id: string;
  requestId: string;
  requestTitle: string;
  category: Category;
  status: RequestStatus;
  otherParty: { id: string; name: string; avatar?: string | null; neighborhood: string };
  lastMessage: { id: string; content: string; senderId: string; senderName: string; createdAt: string } | null;
  updatedAt: string;
}
