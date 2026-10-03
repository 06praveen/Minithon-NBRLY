import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { requestsApi } from '../api/requests';
import { HelpRequest, Review } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { RatingModal } from '../components/ui/RatingModal';
import { HelpChat } from '../components/chat/HelpChat';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  HeartHandshake,
  Play,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    requests,
    currentUser,
    acceptRequest,
    startRequest,
    requestCompletion,
    confirmCompletion,
    rejectCompletion,
    submitReview,
    cancelRequest,
  } = useRequests();

  const [liveRequest, setLiveRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmDoneOpen, setConfirmDoneOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Fetch live request from backend API
  const fetchLive = useCallback(async (isPolling = false) => {
    if (!id) return;
    try {
      const fetched = await requestsApi.getById(id);
      if (fetched) {
        setLiveRequest(fetched);
      }
    } catch {
      // fallback to context state if initial load
      if (!isPolling) {
        const fallback = requests.find((r) => r.id === id);
        if (fallback) {
          setLiveRequest(fallback);
        }
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [id, requests]);

  // Initial load
  useEffect(() => {
    fetchLive(false);
  }, [fetchLive]);

  // Active status polling (3 seconds) while request is active
  useEffect(() => {
    if (!id) return;
    const currentStatus = liveRequest?.status;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      return;
    }

    const interval = setInterval(() => {
      fetchLive(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, liveRequest?.status, fetchLive]);

  // Request fallback
  const request = liveRequest || requests.find((r) => r.id === id) || requests[0];

  if (loading && !request) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-charcoal border-t-lime animate-spin mx-auto" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-gray">Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-heading text-charcoal">REQUEST NOT FOUND</h2>
        <p className="text-sm text-muted-gray">This help request may have been removed or completed.</p>
        <Link to="/explore">
          <Button variant="secondary" size="sm">Back to Explore Feed</Button>
        </Link>
      </div>
    );
  }

  const isRequester = currentUser?.id === request.requester?.id || (Boolean(currentUser?.name) && request.requester?.name === currentUser?.name);
  const isHelper = Boolean(
    request.helper && (request.helper.id === currentUser?.id || (Boolean(currentUser?.name) && request.helper.name === currentUser?.name))
  );
  const isParticipant = isRequester || isHelper;

  // Find user's existing review for this request
  const myReview = request.reviews?.find(
    (r: Review) => r.reviewerId === currentUser.id || r.reviewerName === currentUser.name
  );

  const handleConfirmAccept = async () => {
    if (!localStorage.getItem('nbrly_token')) {
      setConfirmAcceptOpen(false);
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      const updated = await acceptRequest(request.id);
      if (updated) setLiveRequest(updated);
      setConfirmAcceptOpen(false);
    } catch {
      // error toast is shown in context
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStart = async () => {
    setActionLoading(true);
    try {
      const updated = await startRequest(request.id);
      if (updated) setLiveRequest(updated);
      setConfirmStartOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper marks work done
  const handleMarkHelpDone = async () => {
    setActionLoading(true);
    try {
      const updated = await requestCompletion(request.id);
      if (updated) setLiveRequest(updated);
      setConfirmDoneOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Requester confirms completion
  const handleConfirmCompletion = async () => {
    setActionLoading(true);
    try {
      const updated = await confirmCompletion(request.id);
      if (updated) setLiveRequest(updated);
      // Open rating modal for requester
      setRatingModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Requester rejects/postpones completion
  const handleRejectCompletion = async () => {
    setActionLoading(true);
    try {
      const updated = await rejectCompletion(request.id);
      if (updated) setLiveRequest(updated);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit two-way rating
  const handleRatingSubmit = async (rating: number, reviewText: string) => {
    setActionLoading(true);
    try {
      await submitReview(request.id, rating, reviewText);
      await fetchLive(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await cancelRequest(request.id);
      if (updated) setLiveRequest(updated);
      setConfirmCancelOpen(false);
    } finally {
      setActionLoading(false);
    }
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
        
        {/* Left main details & Chat */}
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
                {request.distanceKm !== undefined && (
                  <span className="text-muted-gray font-normal text-xs">({request.distanceKm} km away)</span>
                )}
              </span>
            </Card>
          </div>

          {/* Reward info */}
          <Card variant="paper" className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-gray">Appreciation / Reward</span>
            <span className="text-sm font-bold text-charcoal">{request.reward || 'Heartfelt Gratitude 🙏'}</span>
          </Card>

          {/* ─── REQUEST-SPECIFIC HELP CHAT SECTION ─── */}
          <div className="pt-2 space-y-3">
            {request.status === 'OPEN' ? (
              <Card variant="paper" className="p-6 text-center space-y-2 border-dashed border-nbrly-border">
                <div className="w-10 h-10 rounded-full bg-paper border border-nbrly-border flex items-center justify-center mx-auto text-muted-gray">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-heading text-charcoal uppercase">Help Chat</h4>
                <p className="text-xs text-muted-gray font-sans max-w-sm mx-auto">
                  Chat will be available once a neighbor accepts this request.
                </p>
              </Card>
            ) : isParticipant ? (
              <HelpChat
                requestId={request.id}
                requestTitle={request.title}
                currentUser={currentUser}
              />
            ) : (
              <Card variant="paper" className="p-6 text-center space-y-2 border border-nbrly-border">
                <ShieldCheck className="w-6 h-6 text-muted-gray mx-auto" />
                <h4 className="text-xs font-bold font-heading uppercase text-charcoal">Private Help Conversation</h4>
                <p className="text-xs text-muted-gray font-sans max-w-xs mx-auto">
                  This conversation is active and private between the requester and assigned helper.
                </p>
              </Card>
            )}
          </div>

          {/* ─── COMPLETED REVIEWS SECTION ─── */}
          {request.status === 'COMPLETED' && request.reviews && request.reviews.length > 0 && (
            <Card className="p-5 space-y-3 border border-nbrly-border bg-white">
              <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-muted-gray">
                Community Feedback for this Help ({request.reviews.length})
              </h4>
              <div className="space-y-2.5 divide-y divide-nbrly-border/60">
                {request.reviews.map((rev) => (
                  <div key={rev.id} className="pt-2.5 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={rev.reviewerAvatar} name={rev.reviewerName || 'Neighbor'} size="sm" />
                        <span className="text-xs font-bold text-charcoal">{rev.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-nbrly-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-charcoal/80 font-sans italic pl-8">
                      "{rev.comment || rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

        {/* Right sidebar requester/helper info & Action buttons */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="space-y-6 text-center">
            
            {/* Requester Info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-3">
                Requested By
              </span>
              {(() => {
                const profileLink = request.requester.id === currentUser.id ? '/profile' : `/profile/${request.requester.id}`;
                return (
                  <Link
                    to={profileLink}
                    className="group block p-3 rounded-card hover:bg-paper/80 border border-transparent hover:border-nbrly-border transition-all"
                  >
                    <div className="flex flex-col items-center">
                      <Avatar src={request.requester.avatar} name={request.requester.name} size="xl" className="mb-2 group-hover:scale-105 transition-transform" />
                      <h3 className="text-base font-bold font-heading text-charcoal group-hover:text-black transition-colors flex items-center gap-1">
                        {request.requester.name}
                        <span className="text-xs font-normal text-muted-gray">↗</span>
                      </h3>
                      <p className="text-xs text-muted-gray font-sans">{request.requester.neighborhood}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-paper border border-nbrly-border px-2.5 py-0.5 rounded-full text-xs font-bold text-charcoal">
                        <span className="text-charcoal font-bold">★ {request.requester.rating}</span>
                        <span className="text-muted-gray">·</span>
                        <span>{request.requester.completedHelps} helps</span>
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </div>

            {/* Helper Info if assigned */}
            {request.helper && (
              <div className="pt-3 border-t border-nbrly-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-3">
                  Assigned Helper
                </span>
                <Link
                  to={request.helper.id === currentUser.id ? '/profile' : `/profile/${request.helper.id}`}
                  className="group block p-3 rounded-card bg-paper/60 hover:bg-paper border border-nbrly-border/70 transition-all"
                >
                  <div className="flex flex-col items-center">
                    <Avatar src={request.helper.avatar} name={request.helper.name} size="lg" className="mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="text-sm font-bold font-heading text-charcoal group-hover:text-black transition-colors">
                      {request.helper.name}
                    </h4>
                    <p className="text-[11px] text-muted-gray font-sans">{request.helper.neighborhood}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-charcoal">
                      <Star className="w-3.5 h-3.5 fill-lime text-charcoal" /> {request.helper.rating}
                      <span className="text-muted-gray">·</span>
                      <span className="text-[11px] text-muted-gray font-normal">{request.helper.completedHelps} helps</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* ─── ROLE-BASED ACTION CONTROLS ─── */}
            <div className="space-y-3 pt-3 border-t border-nbrly-border">
              
              {/* 1. STATUS: OPEN */}
              {request.status === 'OPEN' && (
                !isRequester ? (
                  <Button
                    variant="lime"
                    size="lg"
                    className="w-full shadow-md font-bold font-heading"
                    disabled={actionLoading}
                    onClick={() => {
                      if (!localStorage.getItem('nbrly_token')) {
                        navigate('/login');
                      } else {
                        setConfirmAcceptOpen(true);
                      }
                    }}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ACCEPTING...
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="w-5 h-5" /> I CAN HELP →
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="p-3 bg-paper rounded-button text-xs text-muted-gray border border-nbrly-border font-sans">
                    Awaiting a neighbor to accept your request.
                  </div>
                )
              )}

              {/* 2. STATUS: ACCEPTED */}
              {request.status === 'ACCEPTED' && (
                isHelper ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-lime/30 text-charcoal rounded-button text-xs font-bold border border-lime flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-charcoal" /> YOU ARE ASSIGNED HELPER
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold font-heading"
                      disabled={actionLoading}
                      onClick={() => setConfirmStartOpen(true)}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> STARTING...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> START HELPING →
                        </>
                      )}
                    </Button>
                  </div>
                ) : isRequester ? (
                  <div className="p-3 bg-lime/20 text-charcoal rounded-button text-xs font-medium border border-lime/60 font-sans">
                    <strong>{request.helper?.name || 'Helper'}</strong> accepted your request. Coordinate details in the chat below.
                  </div>
                ) : (
                  <div className="p-3 bg-paper rounded-button text-xs text-muted-gray border border-nbrly-border">
                    A helper has been assigned to this request.
                  </div>
                )
              )}

              {/* 3. STATUS: IN_PROGRESS */}
              {request.status === 'IN_PROGRESS' && (
                isHelper ? (
                  !request.completionRequestedAt ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50 text-amber-900 rounded-button text-xs font-bold border border-amber-200">
                        ⚡ TASK IS IN PROGRESS
                      </div>
                      <Button
                        variant="lime"
                        size="lg"
                        className="w-full shadow-md font-bold font-heading"
                        onClick={() => setConfirmDoneOpen(true)}
                      >
                        <CheckCircle className="w-5 h-5" /> MARK HELP AS DONE
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50 text-amber-900 rounded-panel text-xs space-y-1.5 border border-amber-200 text-left">
                      <p className="font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4 text-amber-700" /> Awaiting Confirmation
                      </p>
                      <p className="text-[11px] text-amber-800/80 font-sans leading-relaxed">
                        You marked this help as done. Waiting for the requester to confirm.
                      </p>
                    </div>
                  )
                ) : isRequester ? (
                  request.completionRequestedAt ? (
                    /* Prominent Requester Completion Confirmation Card */
                    <div className="p-4 bg-lime/30 border-2 border-lime rounded-panel space-y-3 text-left shadow-lifted">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-charcoal shrink-0" />
                        <h4 className="text-xs font-extrabold font-heading text-charcoal uppercase tracking-wider">
                          HELPER MARKED THIS HELP AS DONE
                        </h4>
                      </div>
                      <p className="text-xs text-charcoal/90 font-sans leading-relaxed">
                        Your helper says the requested work has been completed. Was the help completed?
                      </p>
                      <div className="space-y-2 pt-1">
                        <Button
                          variant="lime"
                          size="md"
                          disabled={actionLoading}
                          className="w-full font-bold font-heading justify-center border border-charcoal/20 shadow-sm"
                          onClick={handleConfirmCompletion}
                        >
                          {actionLoading ? 'CONFIRMING...' : 'CONFIRM COMPLETION ✓'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          className="w-full justify-center text-xs"
                          onClick={handleRejectCompletion}
                        >
                          NOT YET
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 text-amber-900 rounded-button text-xs font-medium border border-amber-200 font-sans">
                      Task is currently in progress. Your helper will mark it done once finished.
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-paper rounded-button text-xs text-muted-gray border border-nbrly-border">
                    Help is currently in progress.
                  </div>
                )
              )}

              {/* 4. STATUS: COMPLETED */}
              {request.status === 'COMPLETED' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-panel font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> HELP COMPLETED
                  </div>

                  {/* Two-Way Rating Controls */}
                  {isRequester && (
                    myReview ? (
                      <div className="p-2.5 bg-paper rounded-button text-xs text-charcoal font-semibold border border-nbrly-border flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-success-green" /> You reviewed your helper ({myReview.rating}★)
                      </div>
                    ) : (
                      <Button
                        variant="lime"
                        size="md"
                        className="w-full font-bold font-heading justify-center shadow-subtle"
                        onClick={() => setRatingModalOpen(true)}
                      >
                        <Star className="w-4 h-4 fill-charcoal text-charcoal" /> RATE YOUR HELPER
                      </Button>
                    )
                  )}

                  {isHelper && (
                    myReview ? (
                      <div className="p-2.5 bg-paper rounded-button text-xs text-charcoal font-semibold border border-nbrly-border flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-success-green" /> You reviewed your requester ({myReview.rating}★)
                      </div>
                    ) : (
                      <Button
                        variant="lime"
                        size="md"
                        className="w-full font-bold font-heading justify-center shadow-subtle"
                        onClick={() => setRatingModalOpen(true)}
                      >
                        <Star className="w-4 h-4 fill-charcoal text-charcoal" /> RATE YOUR REQUESTER
                      </Button>
                    )
                  )}
                </div>
              )}

              {/* Cancellation Option for Owner when Open/Accepted */}
              {isRequester && (request.status === 'OPEN' || request.status === 'ACCEPTED') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-urgent-red hover:bg-red-50 text-xs"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  <XCircle className="w-4 h-4" /> Cancel Request
                </Button>
              )}

            </div>
          </Card>

        </div>

      </div>

      {/* ─── CONFIRMATION MODALS ─── */}

      {/* Accept Confirmation */}
      {confirmAcceptOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">HELP WITH THIS REQUEST?</h3>
            <p className="text-xs text-muted-gray font-sans">
              You will be assigned as the helper for <strong className="text-charcoal">{request.title}</strong> and private chat will open.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" disabled={actionLoading} onClick={() => setConfirmAcceptOpen(false)}>Not now</Button>
              <Button variant="lime" disabled={actionLoading} onClick={handleConfirmAccept}>
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> ACCEPTING...
                  </>
                ) : (
                  'Yes, I can help →'
                )}
              </Button>
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

      {/* Helper Mark Done Confirmation */}
      {confirmDoneOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-lifted">
            <h3 className="text-xl font-bold font-heading text-charcoal">DONE WITH YOUR PART?</h3>
            <p className="text-xs text-muted-gray font-sans">
              This will notify <strong className="text-charcoal">{request.requester.name}</strong> to verify and confirm completion.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmDoneOpen(false)}>Not yet</Button>
              <Button variant="lime" onClick={handleMarkHelpDone}>Yes, mark done →</Button>
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

      {/* Two-Way Rating Modal */}
      <RatingModal
        title={isRequester ? 'RATE YOUR HELPER' : 'RATE YOUR REQUESTER'}
        otherPartyName={isRequester ? (request.helper?.name || 'Helper') : request.requester.name}
        role={isRequester ? 'helper' : 'requester'}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />

    </div>
  );
};
