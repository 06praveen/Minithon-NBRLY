import React from 'react';
import { Button } from './Button';
import { Sparkles, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "NO REQUESTS YET",
  description = "Your neighborhood is quiet right now. Be the first to start a conversation or ask for help.",
  actionText = "Create a request",
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white border border-dashed border-nbrly-border rounded-card p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 bg-paper rounded-full flex items-center justify-center text-charcoal mb-4 border border-nbrly-border">
        {icon || <Sparkles className="w-6 h-6 text-charcoal/70" />}
      </div>
      <h3 className="text-xl font-bold font-heading text-charcoal mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-gray font-sans mb-6 max-w-md">
        {description}
      </p>
      {onAction && (
        <Button variant="lime" onClick={onAction}>
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
