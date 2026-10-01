import React from 'react';
import { cn } from '../../utils/cn';
import { Urgency } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'lime' | 'urgent' | 'today' | 'flexible' | 'outline' | 'dark';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const base = "inline-flex items-center tracking-wide font-sans font-semibold rounded-full uppercase";
  
  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  const variants = {
    default: "bg-paper text-charcoal border border-nbrly-border",
    lime: "bg-lime text-charcoal font-bold border border-charcoal/10",
    urgent: "bg-red-100 text-red-700 border border-red-200",
    today: "bg-amber-100 text-amber-800 border border-amber-200",
    flexible: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    outline: "bg-transparent text-muted-gray border border-nbrly-border",
    dark: "bg-charcoal text-white",
  };

  return (
    <span className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: Urgency }> = ({ urgency }) => {
  if (urgency === 'URGENT') {
    return <Badge variant="urgent">⚡ Urgent</Badge>;
  }
  if (urgency === 'TODAY') {
    return <Badge variant="today">📅 Today</Badge>;
  }
  return <Badge variant="flexible">🌱 Flexible</Badge>;
};
