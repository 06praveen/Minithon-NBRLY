import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types';
import { UrgencyBadge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { MapPin, ArrowRight, Sparkles, Star } from 'lucide-react';

interface RequestPopupProps {
  request: HelpRequest;
}

export const RequestPopup: React.FC<RequestPopupProps> = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 w-[260px] sm:w-[280px] space-y-3 font-sans text-charcoal">
      {/* Category & Status */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-nbrly-border">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray truncate max-w-[130px]">
          {request.category}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Title */}
      <h4 className="font-heading font-bold text-sm text-charcoal leading-snug line-clamp-2">
        {request.title}
      </h4>

      {/* Match Score */}
      {request.matchScore && (
        <div className="flex items-center justify-between bg-lime/25 border border-lime/60 px-2 py-1 rounded-md text-[11px]">
          <span className="font-bold flex items-center gap-1 text-charcoal">
            <Sparkles className="w-3 h-3 text-charcoal" /> MATCH
          </span>
          <span className="font-extrabold bg-lime px-1.5 py-0.5 rounded-full text-charcoal text-[10px]">
            {request.matchScore}%
          </span>
        </div>
      )}

      {/* Location & Distance */}
      <div className="flex items-center gap-1 text-[11px] text-muted-gray font-medium">
        <MapPin className="w-3 h-3 text-charcoal shrink-0" />
        <span className="truncate text-charcoal font-semibold">{request.neighborhood}</span>
        {request.distanceKm !== undefined && (
          <span className="shrink-0 text-muted-gray">· {request.distanceKm} km away</span>
        )}
      </div>

      {/* Requester Profile Snippet */}
      <div className="flex items-center gap-2 pt-1">
        <Avatar src={request.requester.avatar} name={request.requester.name} size="sm" />
        <div className="text-[11px] leading-tight">
          <p className="font-bold text-charcoal truncate max-w-[150px]">{request.requester.name}</p>
          <p className="text-muted-gray flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-lime text-charcoal" /> {request.requester.rating} · {request.requester.completedHelps} helps
          </p>
        </div>
      </div>

      {/* View Request CTA */}
      <div className="pt-2 border-t border-nbrly-border">
        <Button
          variant="lime"
          size="sm"
          className="w-full text-xs font-bold justify-center"
          onClick={() => navigate(`/request/${request.id}`)}
        >
          VIEW REQUEST <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
