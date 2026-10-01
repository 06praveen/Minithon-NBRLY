import React, { useState } from 'react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface RatingModalProps {
  otherPartyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  otherPartyName,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmit(rating, review);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-nbrly-border rounded-panel max-w-md w-full p-6 sm:p-8 space-y-6 shadow-lifted relative">
        
        <button
          onClick={onClose}
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
              <h3 className="text-2xl font-bold font-heading text-charcoal">HOW DID IT GO?</h3>
              <p className="text-xs text-muted-gray font-sans mt-1">
                Rate your experience helping with <strong className="text-charcoal">{otherPartyName}</strong>.
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
              placeholder="Write a short review about how prompt and friendly your neighbor was..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Skip for now
              </Button>
              <Button type="submit" variant="lime">
                SUBMIT RATING ★
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
