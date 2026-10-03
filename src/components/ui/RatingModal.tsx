import React, { useState } from 'react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface RatingModalProps {
  title?: string;
  otherPartyName: string;
  role?: 'helper' | 'requester';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void> | void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  title,
  otherPartyName,
  role = 'helper',
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const defaultTitle = role === 'helper' ? 'RATE YOUR HELPER' : 'RATE YOUR REQUESTER';
  const defaultPrompt =
    role === 'helper'
      ? `Rate your experience receiving help from ${otherPartyName}.`
      : `Rate your experience helping ${otherPartyName}.`;
  const defaultPlaceholder =
    role === 'helper'
      ? 'How was their help? (e.g. Prompt, friendly, very helpful with the task...)'
      : 'How was your experience helping them? (e.g. Great communication, clear instructions...)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(rating, review);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-nbrly-border rounded-panel max-w-md w-full p-6 sm:p-8 space-y-6 shadow-lifted relative">
        
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-2 text-muted-gray hover:text-charcoal rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-lime text-charcoal rounded-full flex items-center justify-center mx-auto border border-charcoal/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-charcoal">RATING SUBMITTED!</h3>
            <p className="text-xs text-muted-gray font-sans">Thank you for building community trust in your neighborhood.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-gray block mb-1">
                COMMUNITY FEEDBACK
              </span>
              <h3 className="text-2xl font-bold font-heading text-charcoal">
                {title || defaultTitle}
              </h3>
              <p className="text-xs text-muted-gray font-sans mt-1">
                {defaultPrompt}
              </p>
            </div>

            {/* Interactive 5-Star Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-nbrly-border'
                    }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder={defaultPlaceholder}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Skip for now
              </Button>
              <Button type="submit" variant="lime" disabled={submitting}>
                {submitting ? 'Submitting...' : 'SUBMIT REVIEW ★'}
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
