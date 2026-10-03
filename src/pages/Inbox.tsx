import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notificationsApi } from '../api/notifications';
import { AppNotification, ConversationSummary } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/Badge';
import {
  Inbox as InboxIcon,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  Play,
  CheckCircle2,
  Star,
  Check,
  CheckCheck,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

type TabType = 'all' | 'requests' | 'messages' | 'matches';

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInboxData = useCallback(async (isPolling = false) => {
    try {
      if (activeTab === 'messages') {
        const convos = await notificationsApi.getConversations();
        setConversations(convos);
      } else {
        const list = await notificationsApi.list(activeTab);
        setNotifications(list);
      }
    } catch {
      // Graceful fallback
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchInboxData(false);
  }, [fetchInboxData]);

  // Polling every 7 seconds while inbox is open
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInboxData(true);
      refreshNotifications();
    }, 7000);

    return () => clearInterval(interval);
  }, [fetchInboxData, refreshNotifications]);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    if (notif.requestId) {
      navigate(`/request/${notif.requestId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hr ago`;
      if (diffDays === 1) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'MATCH':
        return (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            notif.urgency === 'URGENT' ? 'bg-red-100 text-urgent-red border border-red-200' : 'bg-lime/40 text-charcoal border border-charcoal/20'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'REQUEST_ACCEPTED':
        return (
          <div className="w-9 h-9 rounded-full bg-lime text-charcoal border border-charcoal/20 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
        );
      case 'NEW_MESSAGE':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'REQUEST_STARTED':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4" />
          </div>
        );
      case 'COMPLETION_REQUESTED':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'REQUEST_COMPLETED':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'REVIEW_AVAILABLE':
        return (
          <div className="w-9 h-9 rounded-full bg-lime/60 text-charcoal border border-charcoal/20 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-charcoal text-charcoal" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-paper text-charcoal border border-nbrly-border flex items-center justify-center shrink-0">
            <InboxIcon className="w-4 h-4" />
          </div>
        );
    }
  };

  const renderActionBtn = (notif: AppNotification) => {
    switch (notif.type) {
      case 'MATCH':
        return (
          <Button variant="lime" size="sm" className="text-xs shrink-0 font-bold">
            View Request <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        );
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_STARTED':
      case 'COMPLETION_REQUESTED':
        return (
          <Button variant="secondary" size="sm" className="text-xs shrink-0">
            Open Request
          </Button>
        );
      case 'NEW_MESSAGE':
        return (
          <Button variant="secondary" size="sm" className="text-xs shrink-0">
            Open Chat
          </Button>
        );
      case 'REVIEW_AVAILABLE':
        return (
          <Button variant="lime" size="sm" className="text-xs shrink-0 font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 fill-charcoal text-charcoal mr-1" /> Review Help
          </Button>
        );
      default:
        return (
          <Button variant="ghost" size="sm" className="text-xs shrink-0">
            View
          </Button>
        );
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      
      <PageHeader
        kicker="NOTIFICATIONS & UPDATES"
        title="INBOX"
        description="Stay updated with nearby smart matches, request responses, chat messages, and completion reviews."
        action={
          unreadNotificationsCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-nbrly-border pb-3 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'requests', label: 'Requests' },
            { id: 'messages', label: 'Messages' },
            { id: 'matches', label: 'Smart Matches' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold font-heading transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-charcoal text-white shadow-subtle'
                : 'bg-paper text-muted-gray hover:text-charcoal hover:bg-paper/80 border border-nbrly-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-charcoal border-t-lime animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-gray">Loading inbox...</p>
        </div>
      ) : activeTab === 'messages' ? (
        /* Messages / Conversations Hub */
        conversations.length === 0 ? (
          <Card variant="paper" className="p-12 text-center space-y-3 border-dashed border-nbrly-border">
            <div className="w-12 h-12 rounded-full bg-paper border border-nbrly-border flex items-center justify-center mx-auto text-muted-gray">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-heading text-charcoal uppercase">No Active Conversations</h3>
            <p className="text-xs text-muted-gray font-sans max-w-sm mx-auto">
              Help chats are created automatically when a neighbor accepts a help request.
            </p>
            <Link to="/explore">
              <Button variant="secondary" size="sm" className="mt-2">Browse Explore Feed</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <Card
                key={convo.id}
                onClick={() => navigate(`/request/${convo.requestId}`)}
                className="p-4 cursor-pointer transition-all border border-nbrly-border bg-white hover:border-charcoal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <Avatar
                    src={convo.otherParty?.avatar || undefined}
                    name={convo.otherParty?.name || 'Neighbor'}
                    size="md"
                    className="shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-charcoal font-heading">
                        {convo.otherParty?.name}
                      </h4>
                      <StatusBadge status={convo.status} />
                      <span className="text-[11px] text-muted-gray font-sans">
                        · {convo.requestTitle}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal/80 font-sans line-clamp-1 italic">
                      {convo.lastMessage ? `"${convo.lastMessage.content}"` : 'No messages yet. Start coordinating!'}
                    </p>

                    <div className="text-[10px] text-muted-gray font-sans flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(convo.updatedAt)}</span>
                      <span>·</span>
                      <span>{convo.category}</span>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="text-xs shrink-0 self-end sm:self-center">
                  Open Chat <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        )
      ) : notifications.length === 0 ? (
        /* Empty Notifications State */
        <Card variant="paper" className="p-12 text-center space-y-3 border-dashed border-nbrly-border">
          <div className="w-12 h-12 rounded-full bg-lime/30 border border-charcoal/10 flex items-center justify-center mx-auto text-charcoal">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-charcoal uppercase">You're All Caught Up</h3>
          <p className="text-xs text-muted-gray font-sans max-w-sm mx-auto">
            {activeTab === 'matches'
              ? 'No new smart matches found right now. Check back as neighbors post new requests.'
              : activeTab === 'requests'
              ? 'No request updates at this moment.'
              : 'You have no new notifications in your inbox.'}
          </p>
        </Card>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 cursor-pointer transition-all border ${
                notif.read
                  ? 'bg-white border-nbrly-border hover:border-charcoal'
                  : 'bg-lime/10 border-lime/80 shadow-subtle hover:border-charcoal'
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {renderIcon(notif)}
                
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-lime border border-charcoal/30 shrink-0" />
                    )}
                    
                    <h4 className="text-xs sm:text-sm font-bold text-charcoal font-heading">
                      {notif.title}
                    </h4>

                    {notif.urgency && (
                      <UrgencyBadge urgency={notif.urgency} />
                    )}

                    {notif.matchScore && (
                      <span className="text-[10px] bg-lime px-2 py-0.5 rounded-full font-bold text-charcoal border border-charcoal/10">
                        {notif.matchScore}% MATCH
                      </span>
                    )}

                    {notif.distanceKm !== null && notif.distanceKm !== undefined && (
                      <span className="text-[11px] text-muted-gray font-sans">
                        · {notif.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal/80 font-sans leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="text-[10px] text-muted-gray font-sans flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(notif.createdAt)}</span>
                    {notif.actor?.name && (
                      <>
                        <span>·</span>
                        <span>From {notif.actor.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {renderActionBtn(notif)}
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
