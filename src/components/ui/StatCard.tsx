import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'accent' | 'dark';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  variant = 'default',
}) => {
  const styles = {
    default: "bg-white border border-nbrly-border text-charcoal",
    accent: "bg-lime border border-charcoal/20 text-charcoal",
    dark: "bg-charcoal text-white border border-charcoal",
  };

  return (
    <div className={cn("p-5 rounded-card flex flex-col justify-between transition-all", styles[variant])}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80 font-sans">
          {label}
        </span>
        {icon && <div className="text-current opacity-70">{icon}</div>}
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
          {value}
        </div>
        {trend && (
          <p className="mt-1 text-xs opacity-75 font-sans">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};
