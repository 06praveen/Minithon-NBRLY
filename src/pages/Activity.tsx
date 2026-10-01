import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useRequests } from '../context/RequestContext';
import { Clock, MapPin, CheckCircle2, Play, ArrowRight, PlusCircle, Search, Inbox, XCircle, Star } from 'lucide-react';

type TabId = 'my-requests' | 'helping' | 'completed' | 'cancelled';

const TABS: { id: TabId; label: string }[] = [
  { id: 'my-requests', label: 'My Requests' },
  { id: 'helping', label: "I'm Helping" },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const Activity: React.FC = () => {
  const navigate = useNavigate();
  const { activities, startRequest, completeRequest } = useRequests();
  const [activeTab, setActiveTab] = useState<TabId>('my-requests');

  const filteredActivities = activities.filter((act) => {
    switch (activeTab) {
      case 'my-requests':
        return act.role === 'created' && act.status !== 'CANCELLED';
      case 'helping':
        return act.role === 'helping' && act.status !== 'COMPLETED' && act.status !== 'CANCELLED';
      case 'completed':
        return act.status === 'COMPLETED';
      case 'cancelled':
        return act.status === 'CANCELLED';
      default:
        return true;
    }
  });

  const renderEmptyState = () => {
    switch (activeTab) {
      case 'my-requests':
        return (
          <EmptyState
            title="No requests yet."
            description="Need a hand? Your neighborhood is here."
            actionText="Create a request"
            onAction={() => navigate('/create')}
            icon={<PlusCircle className="w-6 h-6 text-charcoal/70" />}
          />
        );
      case 'helping':
        return (
          <EmptyState
            title="Nobody needs your help right now."
            description="Check back soon or explore nearby requests."
            actionText="Explore requests"
            onAction={() => navigate('/explore')}
            icon={<Search className="w-6 h-6 text-charcoal/70" />}
          />
        );
      case 'completed':
        return (
          <EmptyState
            title="Your good deeds start here."
            description="Complete your first neighborhood help."
            actionText="Find someone to help"
            onAction={() => navigate('/explore')}
            icon={<CheckCircle2 className="w-6 h-6 text-charcoal/70" />}
          />
        );
      case 'cancelled':
        return (
          <EmptyState
            title="No cancelled requests."
            description="All your requests are active or completed."
            icon={<Inbox className="w-6 h-6 text-charcoal/70" />}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      
      <PageHeader
        kicker="TRACKING & PROGRESS"
        title="MY ACTIVITY"
        description="Keep track of the help you've asked for and the help you've given."
      />

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-nbrly-border pb-3 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const count = activities.filter((act) => {
            switch (tab.id) {
              case 'my-requests': return act.role === 'created' && act.status !== 'CANCELLED';
              case 'helping': return act.role === 'helping' && act.status !== 'COMPLETED' && act.status !== 'CANCELLED';
              case 'completed': return act.status === 'COMPLETED';
              case 'cancelled': return act.status === 'CANCELLED';
              default: return false;
            }
          }).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-button transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-charcoal text-white shadow-subtle'
                  : 'bg-white text-charcoal border border-nbrly-border hover:bg-paper'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-lime text-charcoal' : 'bg-paper text-muted-gray'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Activities Feed */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act) => (
            <Card
              key={act.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                act.status === 'CANCELLED' ? 'opacity-60' : 'hover:border-charcoal'
              }`}
            >
              <div className="space-y-2 max-w-xl flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase text-muted-gray">{act.category}</span>
                  <UrgencyBadge urgency={act.urgency} />
                  <StatusBadge status={act.status} />
                </div>

                <h3
                  className="text-lg font-bold font-heading text-charcoal cursor-pointer hover:underline"
                  onClick={() => navigate(`/request/${act.requestId}`)}
                >
                  {act.requestTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-gray font-sans">
                  <span className="flex items-center gap-1 font-medium text-charcoal">
                    <MapPin className="w-3.5 h-3.5" /> {act.neighborhood}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Updated {act.updatedAt}
                  </span>
                  <span>
                    {act.role === 'helping' ? 'Requester:' : 'Helper:'}{' '}
                    <strong className="text-charcoal">{act.otherPartyName}</strong>
                  </span>
                </div>

                {/* Completed badge with star */}
                {act.status === 'COMPLETED' && (
                  <div className="flex items-center gap-1 text-xs text-success-green font-semibold pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                    <span className="flex items-center gap-0.5 text-charcoal ml-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-lime text-charcoal" />
                      ))}
                    </span>
                  </div>
                )}

                {/* Cancelled muted date */}
                {act.status === 'CANCELLED' && (
                  <div className="flex items-center gap-1 text-xs text-muted-gray pt-0.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelled · {act.updatedAt}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="shrink-0 pt-2 sm:pt-0 flex items-center gap-2">
                {act.status === 'ACCEPTED' && act.role === 'helping' && (
                  <Button variant="primary" size="sm" onClick={() => startRequest(act.requestId)}>
                    <Play className="w-3.5 h-3.5" /> START HELP
                  </Button>
                )}
                {act.status === 'IN_PROGRESS' && act.role === 'helping' && (
                  <Button
                    variant="lime"
                    size="sm"
                    onClick={() => completeRequest(act.requestId, 5, 'Great experience helping neighbor!')}
                  >
                    <CheckCircle2 className="w-4 h-4" /> MARK COMPLETED
                  </Button>
                )}
                {act.status !== 'CANCELLED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/request/${act.requestId}`)}
                  >
                    {act.status === 'COMPLETED' ? 'VIEW' : 'CONTINUE'} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};
