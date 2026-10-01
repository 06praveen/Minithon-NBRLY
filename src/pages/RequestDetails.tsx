import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { RatingModal } from '../components/ui/RatingModal';
import { ArrowLeft, Sparkles, CheckCircle2, Clock, MapPin, HeartHandshake, Play, CheckCircle, XCircle } from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { requests, currentUser, acceptRequest, startRequest, completeRequest, cancelRequest, getUserById } = useRequests();

  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Find target request or fallback to first
  const request = requests.find((r) => r.id === id) || requests[0];

  const isOwner = currentUser.id === request.requester.id;

  const handleConfirmAccept = () => {
    acceptRequest(request.id);
    setConfirmAcceptOpen(false);
  };

  const handleConfirmStart = () => {
    startRequest(request.id);
    setConfirmStartOpen(false);
  };

  const handleConfirmComplete = () => {
    setConfirmCompleteOpen(false);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = (rating: number, review: string) => {
    completeRequest(request.id, rating, review);
  };

  const handleConfirmCancel = () => {
    cancelRequest(request.id);
    setConfirmCancelOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 sm:pb-8">
      
      {/* Back button */}
      <div>
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-gray hover:text-charcoal transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK TO EXPLORE FEED
        </Link>
      </div>

      <PageHeader
        kicker={request.category}
        title={request.title}
        action={
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        }
      />

      {/* Visual Lifecycle Stepper Timeline */}
      <StatusTimeline status={request.status} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Smart Match Banner */}
          {request.matchScore && (
            <Card variant="accent" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-charcoal" /> WHY THIS MATCH? (NEIGHBORMATCH)
                </span>
                <span className="font-extrabold text-lg bg-lime px-3 py-0.5 rounded-full border border-charcoal/20">
                  {request.matchScore}% MATCH
                </span>
              </div>
              
              <div className="space-y-1.5 pt-2 border-t border-charcoal/10 font-sans text-xs text-charcoal/90">
                {request.matchReasons?.map((reason, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
              <p className="text-[10px] text-charcoal/70 font-sans italic pt-1">
                Deterministic matching based on neighborhood proximity, skills alignment, and scheduling.
              </p>
            </Card>
          )}

          {/* Detailed description */}
          <Card className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-gray font-sans">
              Request Overview
            </h3>
            <p className="text-base text-charcoal font-sans leading-relaxed">
              {request.description}
            </p>
          </Card>

          {/* Time & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="paper" className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-gray block">Preferred Time</span>
              <span className="text-sm font-bold text-charcoal flex items-center gap-1.5 font-heading">
                <Clock className="w-4 h-4 text-charcoal" /> {request.preferredDate} · {request.preferredTime}
              </span>
            </Card>
            <Card variant="paper" className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-gray block">Location / Neighborhood</span>
              <span className="text-sm font-bold text-charcoal flex items-center gap-1.5 font-heading">
                <MapPin className="w-4 h-4 text-charcoal" /> {request.neighborhood}
              </span>
            </Card>
          </div>

          {/* Reward info */}
          <Card variant="paper" className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-gray">Appreciation / Reward</span>
            <span className="text-sm font-bold text-charcoal">{request.reward || 'Heartfelt Gratitude 🙏'}</span>
          </Card>

        </div>

        {/* Right sidebar requester info & Action buttons */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="space-y-6 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-gray block">
              Requested By
            </span>

            {(() => {
              const requesterUser = getUserById(request.requester.id);
              const profileLink = request.requester.id === currentUser.id ? '/profile' : `/profile/${request.requester.id}`;
              const skills = requesterUser?.skills || ['Technology', 'Errands'];
              return (
                <div className="space-y-4">
                  <Link
                    to={profileLink}
                    className="group block p-3 rounded-card hover:bg-paper/80 border border-transparent hover:border-nbrly-border transition-all"
                  >
                    <div className="flex flex-col items-center">
                      <Avatar src={request.requester.avatar} name={request.requester.name} size="xl" className="mb-3 group-hover:scale-105 transition-transform" />
                      <h3 className="text-lg font-bold font-heading text-charcoal group-hover:text-black transition-colors flex items-center gap-1">
                        {request.requester.name}
                        <span className="text-xs font-normal text-muted-gray">↗</span>
                      </h3>
                      <p className="text-xs text-muted-gray font-sans">{request.requester.neighborhood}</p>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 bg-paper border border-nbrly-border px-3 py-1 rounded-full text-xs font-bold text-charcoal">
                        <span className="text-charcoal font-bold">★ {request.requester.rating}</span>
                        <span className="text-muted-gray">·</span>
                        <span>{request.requester.completedHelps} helps</span>
                      </div>
                    </div>
                  </Link>

                  {/* Skills preview */}
                  <div className="text-left bg-paper/60 p-3 rounded-button border border-nbrly-border/70 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray block font-sans">
                      Can help with
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill: string, idx: number) => (
                        <span key={idx} className="text-[11px] font-medium bg-white text-charcoal px-2 py-0.5 rounded-full border border-nbrly-border/80">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust indicator - Privacy safe, no fake verification */}
                  <div className="p-2.5 bg-paper rounded-button text-xs text-charcoal/80 flex items-center justify-center gap-1.5 border border-nbrly-border font-medium">
                    <span className="w-2 h-2 rounded-full bg-success-green inline-block"></span>
                    <span>Community profile · Member since {requesterUser?.joinedAt || '2026'}</span>
                  </div>
                </div>
              );
            })()}

            {/* ACTION BUTTON LIFECYCLE CONTROLS */}
            <div className="space-y-3 pt-2">
              
              {/* If OPEN */}
              {request.status === 'OPEN' && !isOwner && (
                <Button
                  variant="lime"
                  size="lg"
                  className="w-full shadow-md"
                  onClick={() => setConfirmAcceptOpen(true)}
                >
                  <HeartHandshake className="w-5 h-5" /> I CAN HELP →
                </Button>
              )}

              {/* If ACCEPTED -> Action: START HELP */}
              {request.status === 'ACCEPTED' && (
                <div className="space-y-2">
                  <div className="p-3 bg-lime/30 text-charcoal rounded-button text-xs font-bold border border-lime">
                    ✓ YOU ARE MARKED AS HELPER
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setConfirmStartOpen(true)}
                  >
                    <Play className="w-4 h-4" /> START HELPING →
                  </Button>
                </div>
              )}

              {/* If IN_PROGRESS -> Action: MARK AS COMPLETED */}
              {request.status === 'IN_PROGRESS' && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-100 text-amber-900 rounded-button text-xs font-bold border border-amber-300">
                    ⚡ TASK IS CURRENTLY IN PROGRESS
                  </div>
                  <Button
                    variant="lime"
                    size="lg"
                    className="w-full shadow-md"
                    onClick={() => setConfirmCompleteOpen(true)}
                  >
                    <CheckCircle className="w-5 h-5" /> MARK AS COMPLETED →
                  </Button>
                </div>
              )}

              {/* If COMPLETED */}
              {request.status === 'COMPLETED' && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-button font-bold text-sm border border-emerald-200">
                  ✓ VERIFIED COMPLETED
                </div>
              )}

              {/* Owner Cancellation */}
              {isOwner && (request.status === 'OPEN' || request.status === 'ACCEPTED') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-urgent-red hover:bg-red-50"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  <XCircle className="w-4 h-4" /> Cancel Request
                </Button>
              )}

            </div>
          </Card>

        </div>

      </div>

      {/* CONFIRMATION MODALS */}

      {/* Accept Confirmation */}
      {confirmAcceptOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">HELP WITH THIS REQUEST?</h3>
            <p className="text-xs text-muted-gray font-sans">
              You'll be marked as the helper for <strong className="text-charcoal">{request.title}</strong>. The requester will be notified.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmAcceptOpen(false)}>Not now</Button>
              <Button variant="lime" onClick={handleConfirmAccept}>Yes, I can help →</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Start Confirmation */}
      {confirmStartOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">START HELPING NOW?</h3>
            <p className="text-xs text-muted-gray font-sans">
              Status will transition to <strong className="text-charcoal">IN PROGRESS</strong>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmStartOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmStart}>Start help →</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Confirmation */}
      {confirmCompleteOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">DONE WITH THE HELP?</h3>
            <p className="text-xs text-muted-gray font-sans">
              Mark this request as completed once the task is finished.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmCompleteOpen(false)}>Not yet</Button>
              <Button variant="lime" onClick={handleConfirmComplete}>Mark completed →</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">CANCEL THIS REQUEST?</h3>
            <p className="text-xs text-muted-gray font-sans">
              This request will be marked CANCELLED and removed from active neighborhood feeds.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmCancelOpen(false)}>No, keep it</Button>
              <Button variant="danger" onClick={handleConfirmCancel}>Yes, cancel request</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Community Rating Modal */}
      <RatingModal
        otherPartyName={request.requester.name}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />

    </div>
  );
};
