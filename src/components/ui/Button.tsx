import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";
    
    const variants = {
      primary: "bg-charcoal text-white hover:bg-neutral-800 shadow-subtle",
      lime: "bg-lime text-charcoal hover:bg-[#b5e655] font-semibold border border-charcoal/10 shadow-subtle",
      secondary: "bg-white text-charcoal border border-nbrly-border hover:bg-paper hover:border-charcoal/30",
      ghost: "bg-transparent text-charcoal hover:bg-paper/80 hover:text-charcoal",
      outline: "bg-transparent border border-charcoal text-charcoal hover:bg-charcoal hover:text-white",
      danger: "bg-urgent-red text-white hover:bg-red-600",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-button gap-1.5",
      md: "px-4 py-2 text-sm rounded-button gap-2",
      lg: "px-6 py-3 text-base rounded-button gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
