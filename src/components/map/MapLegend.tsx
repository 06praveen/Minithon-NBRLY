import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-nbrly-border rounded-panel px-3 py-1.5 shadow-subtle flex items-center gap-3 text-[11px] font-sans font-semibold text-charcoal pointer-events-auto">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-urgent-red ring-2 ring-urgent-red/30" />
        <span>Urgent</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
        <span>Today</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-lime ring-2 ring-charcoal/20" />
        <span>Flexible</span>
      </div>
      <div className="flex items-center gap-1.5 border-l border-nbrly-border pl-2">
        <span className="w-2.5 h-2.5 rounded-full bg-charcoal ring-2 ring-lime" />
        <span>You</span>
      </div>
    </div>
  );
};
