import React from 'react';
import { RequestStatus } from '../../types';
import { cn } from '../../utils/cn';

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border";

  const config: Record<RequestStatus, { label: string; style: string; dot: string }> = {
    OPEN: {
      label: 'OPEN',
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    ACCEPTED: {
      label: 'ACCEPTED',
      style: 'bg-lime/30 text-charcoal border-lime/60',
      dot: 'bg-charcoal',
    },
    IN_PROGRESS: {
      label: 'IN PROGRESS',
      style: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
    },
    COMPLETED: {
      label: 'COMPLETED',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    CANCELLED: {
      label: 'CANCELLED',
      style: 'bg-gray-100 text-gray-500 border-gray-200',
      dot: 'bg-gray-400',
    },
  };

  const current = config[status];

  return (
    <span className={cn(base, current.style)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      {current.label}
    </span>
  );
};
