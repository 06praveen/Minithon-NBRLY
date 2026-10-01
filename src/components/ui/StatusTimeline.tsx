import React from 'react';
import { RequestStatus } from '../../types';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

interface StatusTimelineProps {
  status: RequestStatus;
  className?: string;
}

const STEPS: { status: RequestStatus; label: string; desc: string }[] = [
  { status: 'OPEN', label: '01 OPEN', desc: 'Request posted to neighborhood' },
  { status: 'ACCEPTED', label: '02 ACCEPTED', desc: 'Neighbor locked in to help' },
  { status: 'IN_PROGRESS', label: '03 IN PROGRESS', desc: 'Task currently underway' },
  { status: 'COMPLETED', label: '04 COMPLETED', desc: 'Task verified finished' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status, className }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-button text-center text-xs font-bold text-gray-600 uppercase">
        ⛔ THIS REQUEST WAS CANCELLED
      </div>
    );
  }

  const getStepIndex = (st: RequestStatus) => {
    switch (st) {
      case 'OPEN': return 0;
      case 'ACCEPTED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className={cn("bg-white border border-nbrly-border rounded-panel p-6 shadow-subtle space-y-4", className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gray block">
        LIFECYCLE STATUS TIMELINE
      </span>

      {/* Desktop Horizontal Process Line */}
      <div className="hidden sm:grid grid-cols-4 gap-2 relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-nbrly-border z-0" />
        
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center text-center space-y-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-heading border transition-all",
                  isCurrent
                    ? "bg-lime text-charcoal border-charcoal scale-110 shadow-md ring-2 ring-lime/40"
                    : isDone
                    ? "bg-charcoal text-white border-charcoal"
                    : "bg-paper text-muted-gray border-nbrly-border"
                )}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <div>
                <p className={cn("text-xs font-bold font-heading uppercase", isCurrent ? "text-charcoal" : isDone ? "text-charcoal/80" : "text-muted-gray")}>
                  {step.label.replace(/^\d+\s+/, '')}
                </p>
                <p className="text-[10px] text-muted-gray font-sans leading-tight mt-0.5 max-w-[100px] mx-auto">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="sm:hidden space-y-4 relative pl-4 border-l-2 border-nbrly-border">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="relative pl-4 space-y-0.5">
              <div
                className={cn(
                  "absolute -left-[25px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-heading border",
                  isCurrent
                    ? "bg-lime text-charcoal border-charcoal"
                    : isDone
                    ? "bg-charcoal text-white border-charcoal"
                    : "bg-paper text-muted-gray border-nbrly-border"
                )}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <p className={cn("text-xs font-bold font-heading uppercase", isCurrent ? "text-charcoal font-extrabold" : "text-muted-gray")}>
                {step.label}
              </p>
              <p className="text-[11px] text-muted-gray font-sans">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
