import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 font-sans">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-white border border-nbrly-border rounded-button px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted-gray focus:outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal transition-colors font-sans",
            error && "border-urgent-red focus:border-urgent-red focus:ring-urgent-red",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-muted-gray">{hint}</p>}
        {error && <p className="mt-1 text-xs text-urgent-red font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
