import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'paper' | 'accent' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: "bg-white border border-nbrly-border rounded-card p-5 shadow-subtle hover:border-charcoal/30 transition-all duration-200",
      paper: "bg-paper border border-nbrly-border rounded-card p-5",
      accent: "bg-lime/20 border border-lime/50 rounded-card p-5",
      outlined: "bg-transparent border border-nbrly-border rounded-card p-5",
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
