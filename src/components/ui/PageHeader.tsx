import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  kicker,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-nbrly-border mb-8", className)}>
      <div className="max-w-2xl">
        {kicker && (
          <span className="text-xs font-semibold tracking-widest text-muted-gray uppercase font-sans mb-1 block">
            {kicker}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-charcoal tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-muted-gray text-base font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
