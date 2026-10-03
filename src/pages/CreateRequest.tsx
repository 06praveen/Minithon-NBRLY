import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UrgencyBadge } from '../components/ui/Badge';
import { useRequests } from '../context/RequestContext';
import { Category, Urgency, HelpRequest } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Clock, MapPin, PlusCircle } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'Healthcare / Medicine', label: 'Healthcare / Medicine' },
  { value: 'Grocery / Errands', label: 'Grocery / Errands' },
  { value: 'Education', label: 'Education / Tutoring' },
  { value: 'Technology', label: 'Technology / Wi-Fi Setup' },
  { value: 'Transport', label: 'Transport / Heavy Lifting' },
  { value: 'Household', label: 'Household Maintenance' },
  { value: 'Elderly Assistance', label: 'Elderly Assistance' },
  { value: 'Other', label: 'Other Assistance' },
];

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { createRequest, currentUser } = useRequests();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Healthcare / Medicine');
  const [urgency, setUrgency] = useState<Urgency>('TODAY');
  const [neighborhood, setNeighborhood] = useState(currentUser.neighborhood || 'Bandra West');
  const [preferredDate, setPreferredDate] = useState('Today');
  const [preferredTime, setPreferredTime] = useState('6:00 PM - 8:00 PM');
  const [reward, setReward] = useState('Free Filter Coffee ☕');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdRequest, setCreatedRequest] = useState<HelpRequest | null>(null);

  // Live estimated NeighborMatch calculation for preview
  const estimatedMatch = Math.min(
    (neighborhood.toLowerCase() === currentUser.neighborhood.toLowerCase() ? 40 : 20) +
    (urgency === 'URGENT' ? 20 : urgency === 'TODAY' ? 15 : 10) +
    25 + 10,
    100
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (description.trim().length < 15) {
      newErrors.description = 'Tell us a little more about what you need (at least 15 characters).';
    }
    if (!neighborhood.trim()) {
      newErrors.neighborhood = 'Neighborhood is required.';
    }
    if (!preferredDate.trim()) {
      newErrors.preferredDate = 'Preferred date is required.';
    }
    if (!preferredTime.trim()) {
      newErrors.preferredTime = 'Preferred time window is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newReq = await createRequest({
      title,
      description,
      category,
      urgency,
      neighborhood,
      preferredDate,
      preferredTime,
      reward,
    });

    setCreatedRequest(newReq);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <PageHeader
        kicker="POST A NEED"
        title="WHAT DO YOU NEED HELP WITH?"
        description="Tell your neighborhood what you need. Someone nearby might be able to help."
      />

      {/* SUCCESS CONFIRMATION VIEW */}
      {createdRequest ? (
        <Card variant="accent" className="p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-lifted">
          <div className="w-16 h-16 bg-lime text-charcoal rounded-full flex items-center justify-center mx-auto border border-charcoal/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-charcoal/80 block mb-1">
              REQUEST POSTED
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-charcoal">
              Your neighborhood has been notified.
            </h2>
            <p className="text-sm text-charcoal/80 font-sans mt-2">
              Your request is now live in <strong className="text-charcoal">{createdRequest.neighborhood}</strong>. Helpers with matching skills will see it prioritized.
            </p>
          </div>

          {/* Created Summary Card */}
          <div className="bg-white p-5 rounded-panel border border-nbrly-border text-left space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-gray">{createdRequest.category}</span>
              <UrgencyBadge urgency={createdRequest.urgency} />
            </div>
            <h3 className="text-lg font-bold font-heading text-charcoal">{createdRequest.title}</h3>
            <div className="flex items-center gap-4 text-xs font-sans text-muted-gray pt-2 border-t border-nbrly-border">
              <span className="flex items-center gap-1 font-medium text-charcoal">
                <MapPin className="w-3.5 h-3.5" /> {createdRequest.neighborhood}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {createdRequest.preferredDate} · {createdRequest.preferredTime}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/request/${createdRequest.id}`)}
            >
              VIEW REQUEST <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setCreatedRequest(null);
                setTitle('');
                setDescription('');
              }}
            >
              <PlusCircle className="w-4 h-4" /> CREATE ANOTHER
            </Button>
          </div>
        </Card>
      ) : (
        /* EDITORIAL FORM VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white border border-nbrly-border rounded-panel p-6 sm:p-8 space-y-6 shadow-subtle">
            
            {/* Title + Counter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Request Title *
                </label>
                <span className="text-[11px] text-muted-gray font-mono">{title.length} / 80</span>
              </div>
              <Input
                placeholder="e.g. Need someone to pick up medicines from pharmacy"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
              />
            </div>

            {/* Category */}
            <Select
              label="Category *"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            />

            {/* Description + Counter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Description *
                </label>
                <span className="text-[11px] text-muted-gray font-mono">{description.length} / 500</span>
              </div>
              <Textarea
                placeholder="Tell your neighbors what you need help with. Include location markers or special instructions..."
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                rows={4}
              />
            </div>

            {/* Urgency Selector Pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2 font-sans">
                Urgency Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['URGENT', 'TODAY', 'FLEXIBLE'] as const).map((urg) => (
                  <button
                    type="button"
                    key={urg}
                    onClick={() => setUrgency(urg)}
                    className={`py-2.5 px-3 rounded-button text-xs font-bold font-sans border transition-all cursor-pointer ${
                      urgency === urg
                        ? urg === 'URGENT'
                          ? 'bg-urgent-red text-white border-red-600'
                          : urg === 'TODAY'
                          ? 'bg-amber-400 text-charcoal border-amber-500'
                          : 'bg-lime text-charcoal border-lime'
                        : 'bg-paper text-charcoal border-nbrly-border hover:bg-paper/80'
                    }`}
                  >
                    {urg === 'URGENT' && '⚡ '}
                    {urg === 'TODAY' && '📅 '}
                    {urg === 'FLEXIBLE' && '🌱 '}
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            {/* Location / Neighborhood & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location / Neighborhood *"
                placeholder="e.g. Bandra West, Mumbai"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                error={errors.neighborhood}
              />
              <Input
                label="Preferred Date *"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                error={errors.preferredDate}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Time Window *"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                error={errors.preferredTime}
              />
              <Input
                label="Optional Reward / Appreciation"
                placeholder="e.g. Free Coffee, ₹50, Gratitude"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-nbrly-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/explore')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="lime"
                className="px-6"
              >
                POST REQUEST <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </form>

          {/* Real-time Match Estimator Widget */}
          <div className="lg:col-span-4 space-y-4">
            <Card variant="accent" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-4 h-4 text-charcoal" /> ESTIMATED MATCH SCORE
                </span>
                <span className="text-2xl font-extrabold font-heading text-charcoal bg-lime px-3 py-0.5 rounded-full border border-charcoal/20">
                  {estimatedMatch}%
                </span>
              </div>
              <p className="text-xs text-charcoal/80 font-sans leading-relaxed">
                Based on your selection of <strong className="text-charcoal">{neighborhood}</strong> and <strong className="text-charcoal">{urgency}</strong> urgency, nearby helpers with matching skills will see this request prioritized.
              </p>
              <div className="text-[11px] text-charcoal/70 space-y-1 font-sans pt-2 border-t border-charcoal/20">
                <p>✓ Neighborhood match score: +40</p>
                <p>✓ Urgency relevance bonus: +{urgency === 'URGENT' ? 20 : urgency === 'TODAY' ? 15 : 10}</p>
                <p>✓ Skill compatibility match: +25</p>
              </div>
            </Card>

            <Card variant="paper" className="space-y-2 text-xs text-muted-gray font-sans">
              <p className="font-semibold text-charcoal flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-charcoal" /> Community Guidelines
              </p>
              <p>NBRLY requests are for neighborly micro-volunteering. Please keep requests safe, polite, and respect volunteer time.</p>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
};
