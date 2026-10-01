import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 font-sans">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full bg-white border border-nbrly-border rounded-button px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal transition-colors font-sans cursor-pointer",
            error && "border-urgent-red focus:border-urgent-red focus:ring-urgent-red",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-urgent-red font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
