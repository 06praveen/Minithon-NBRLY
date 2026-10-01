import React from 'react';
import { HelpRequest } from '../../types';
import { Card } from './Card';
import { UrgencyBadge } from './Badge';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { MapPin, Clock, ArrowRight, Sparkles, CheckCircle2, Star } from 'lucide-react';

interface RequestCardProps {
  request: HelpRequest;
  onHelpClick?: (request: HelpRequest) => void;
  onCardClick?: (request: HelpRequest) => void;
  showMatchScore?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onHelpClick,
  onCardClick,
  showMatchScore = true,
}) => {
  return (
    <Card 
      className="group relative flex flex-col justify-between h-full cursor-pointer hover:border-charcoal hover:-translate-y-0.5 transition-all duration-200"
      onClick={() => onCardClick?.(request)}
    >
      <div>
        {/* Top Category & Status Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">
            {request.category}
          </span>
          <div className="flex items-center gap-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Smart Match Score & Reasons Ribbon */}
        {showMatchScore && request.matchScore && (
          <div className="mb-4 bg-lime/20 border border-lime/60 p-3 rounded-button space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal flex items-center gap-1 font-heading">
                <Sparkles className="w-3.5 h-3.5 text-charcoal" /> SMART MATCH
              </span>
              <span className="text-xs font-extrabold bg-lime text-charcoal px-2.5 py-0.5 rounded-full border border-charcoal/20">
                {request.matchScore}% MATCH
              </span>
            </div>
            {request.matchReasons && (
              <div className="space-y-1 pt-1 border-t border-lime/40">
                {request.matchReasons.slice(0, 2).map((reason, idx) => (
                  <p key={idx} className="text-[11px] font-sans text-charcoal/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success-green shrink-0" />
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Request Title */}
        <h3 className="text-lg font-bold font-heading text-charcoal group-hover:text-black transition-colors mb-2 line-clamp-2">
          {request.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-sm text-muted-gray font-sans line-clamp-3 mb-4 leading-relaxed">
          {request.description}
        </p>
      </div>

      <div>
        {/* Metadata: Location & Time */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-charcoal/80 font-medium py-3 border-t border-nbrly-border/80 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted-gray" />
            <span>{request.preferredDate} · {request.preferredTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-gray" />
            <span className="font-semibold text-charcoal">{request.neighborhood}</span>
          </div>
        </div>

        {/* Requester & Trust Info & Action Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar src={request.requester.avatar} name={request.requester.name} size="sm" />
            <div className="text-xs">
              <p className="font-semibold text-charcoal leading-tight">{request.requester.name}</p>
              <p className="text-[11px] text-muted-gray flex items-center gap-1">
                <Star className="w-3 h-3 fill-lime text-charcoal" />
                {request.requester.rating} · {request.requester.completedHelps} helps
              </p>
            </div>
          </div>

          <Button 
            variant={request.status === 'OPEN' ? 'lime' : 'secondary'}
            size="sm"
            className="group-hover:px-4 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onHelpClick?.(request);
            }}
          >
            {request.status === 'OPEN' ? (
              <>
                I CAN HELP <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              'VIEW DETAILS'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
