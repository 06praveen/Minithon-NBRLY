import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { RequestCard } from '../components/ui/RequestCard';
import { HelpRequest } from '../types';
import { useRequests } from '../context/RequestContext';
import { ArrowRight, Sparkles, ShieldCheck, MapPin, CheckCircle2, Users, HeartHandshake, Clock } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { requests, stats, communityActivity } = useRequests();

  const recentlyCompleted = requests.filter((r) => r.status === 'COMPLETED').slice(0, 3);

  return (
    <div className="space-y-20">
      
      {/* SECTION 1 & 2: HERO WITH EDITORIAL ACTIVITY VISUAL PANEL */}
      <section className="pt-4 pb-8 md:pt-10 md:pb-12 border-b border-nbrly-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime/30 text-charcoal border border-lime/60 rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
              <span className="w-2 h-2 rounded-full bg-lime border border-charcoal/30 animate-pulse" />
              YOUR NEIGHBORHOOD, CONNECTED.
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-heading text-charcoal tracking-tighter leading-[0.95] uppercase">
              HELP<br />
              STARTS<br />
              <span className="bg-lime px-2 py-0.5 rounded-md text-charcoal inline-block transform -rotate-1">
                NEXT DOOR.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-gray font-sans max-w-xl leading-relaxed">
              Ask for a hand, offer your skills, and make everyday life easier — one neighbor at a time. High-relevance matching within walking distance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/create">
                <Button variant="lime" size="lg" className="shadow-md">
                  NEED HELP <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </Link>

              <Link to="/explore">
                <Button variant="secondary" size="lg">
                  I CAN HELP <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Micro Connection Motif */}
            <div className="pt-4 flex items-center gap-6 text-xs text-muted-gray font-sans border-t border-nbrly-border/60">
              <div className="flex items-center gap-1.5 font-medium text-charcoal">
                <ShieldCheck className="w-4 h-4 text-success-green" />
                <span>Verified Neighbors</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-charcoal">
                <Sparkles className="w-4 h-4 text-charcoal" />
                <span>Smart NeighborMatch</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Custom Neighborhood Activity Visual Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-nbrly-border rounded-panel p-6 shadow-lifted relative overflow-hidden">
              
              {/* Board Header */}
              <div className="flex items-center justify-between pb-4 border-b border-nbrly-border mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-charcoal" />
                  <span className="font-heading font-bold text-sm tracking-wide text-charcoal uppercase">
                    NEIGHBORHOOD / BANDRA WEST
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-charcoal bg-lime px-2 py-0.5 rounded-full border border-charcoal/10">
                  LIVE PULSE
                </span>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2 mb-5 font-sans text-xs">
                <div className="flex items-center justify-between text-charcoal font-semibold py-1 px-2.5 bg-paper rounded-button border border-nbrly-border/80">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    PEOPLE HELPING
                  </span>
                  <span className="font-bold font-heading">{String(stats.activeHelpers).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-charcoal font-semibold py-1 px-2.5 bg-paper rounded-button border border-nbrly-border/80">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    OPEN REQUESTS
                  </span>
                  <span className="font-bold font-heading">{String(stats.openRequests).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-charcoal font-semibold py-1 px-2.5 bg-paper rounded-button border border-nbrly-border/80">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-charcoal" />
                    HELPS COMPLETED
                  </span>
                  <span className="font-bold font-heading">{String(stats.completedHelps).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Activity Snippets */}
              <div className="space-y-2.5 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray">Recent Local Activity</p>
                
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} onClick={() => navigate(`/request/${req.id}`)} className="p-3 bg-paper hover:bg-paper/80 border border-nbrly-border rounded-button flex items-center justify-between gap-2 transition-colors cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-charcoal uppercase truncate">{req.title}</p>
                      <p className="text-[11px] text-muted-gray truncate">{req.preferredDate} · {req.preferredTime}</p>
                    </div>
                    <span className="text-[11px] font-bold bg-lime text-charcoal px-2 py-0.5 rounded-full border border-charcoal/10 shrink-0">
                      {req.matchScore}% MATCH
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-nbrly-border text-center">
                <Link to="/explore" className="text-xs font-bold text-charcoal hover:underline inline-flex items-center gap-1">
                  Browse all {requests.length} nearby requests <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: NEIGHBORHOOD PULSE (IMPROVED) */}
      <section className="py-6">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gray block mb-1">
            NEIGHBORHOOD PULSE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal">
            What's happening nearby.
          </h2>
          <p className="mt-1 text-muted-gray font-sans text-sm">
            Small acts of help add up across Bandra West.
          </p>
        </div>

        {/* Main Statistics */}
        <div className="bg-white border border-nbrly-border rounded-panel p-8 shadow-subtle mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-nbrly-border">
            
            <div className="pt-4 md:pt-0 md:pl-0">
              <span className="text-5xl sm:text-6xl font-extrabold font-heading text-charcoal tracking-tighter block mb-1">
                {String(stats.openRequests).padStart(2, '0')}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">Open Requests</p>
              <p className="text-[11px] text-muted-gray mt-0.5">Active in Bandra West</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8">
              <span className="text-5xl sm:text-6xl font-extrabold font-heading text-charcoal tracking-tighter block mb-1">
                {String(stats.activeHelpers).padStart(2, '0')}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">People Helping</p>
              <p className="text-[11px] text-muted-gray mt-0.5">Ready to assist today</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8">
              <span className="text-5xl sm:text-6xl font-extrabold font-heading text-lime-600 tracking-tighter block mb-1">
                {String(stats.completedHelps).padStart(2, '0')}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">Helps Completed</p>
              <p className="text-[11px] text-muted-gray mt-0.5">Verified in neighborhood</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8">
              <span className="text-5xl sm:text-6xl font-extrabold font-heading text-charcoal tracking-tighter block mb-1">
                {String(stats.activeCategories).padStart(2, '0')}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">Active Categories</p>
              <p className="text-[11px] text-muted-gray mt-0.5">Medicine, Errands, Tech, Care</p>
            </div>

          </div>
        </div>

        {/* Detailed Pulse Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-nbrly-border rounded-button p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray">Most Requested</p>
              <p className="text-sm font-bold font-heading text-charcoal mt-0.5">{stats.mostRequestedCategory}</p>
            </div>
            <HeartHandshake className="w-5 h-5 text-charcoal/40" />
          </div>
          <div className="bg-white border border-nbrly-border rounded-button p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray">Most Active</p>
              <p className="text-sm font-bold font-heading text-charcoal mt-0.5">{stats.mostActiveCategory}</p>
            </div>
            <Users className="w-5 h-5 text-charcoal/40" />
          </div>
          <div className="bg-white border border-nbrly-border rounded-button p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray">Most Helpful Time</p>
              <p className="text-sm font-bold font-heading text-charcoal mt-0.5">{stats.peakTime}</p>
            </div>
            <Clock className="w-5 h-5 text-charcoal/40" />
          </div>
        </div>
      </section>

      {/* SECTION: NEIGHBORHOOD ACTIVITY FEED */}
      <section className="py-6 border-t border-nbrly-border">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gray block mb-1">
            NEIGHBORHOOD ACTIVITY
          </span>
          <h2 className="text-3xl font-extrabold font-heading text-charcoal">
            Good things are happening nearby.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community Activity Feed */}
          <div className="bg-white border border-nbrly-border rounded-panel p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray pb-2 border-b border-nbrly-border">
              RECENT COMMUNITY ACTIVITY
            </p>
            <div className="space-y-2">
              {communityActivity.slice(0, 6).map((event) => (
                <div key={event.id} className="flex items-start gap-3 py-2 hover:bg-paper/50 rounded-button px-2 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    event.type === 'HELP_COMPLETED' ? 'bg-success-green' :
                    event.type === 'HELP_ACCEPTED' ? 'bg-lime' :
                    event.type === 'MEMBER_JOINED' ? 'bg-charcoal' :
                    'bg-amber-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs text-charcoal font-sans">
                      {event.type === 'HELP_COMPLETED' && (
                        <><strong>{event.userName}</strong> helped <strong>{event.targetName}</strong> with <em>{event.requestTitle}</em></>
                      )}
                      {event.type === 'HELP_ACCEPTED' && (
                        <><strong>{event.userName}</strong> accepted to help <strong>{event.targetName}</strong> with <em>{event.requestTitle}</em></>
                      )}
                      {event.type === 'REQUEST_CREATED' && (
                        <><strong>{event.userName}</strong> posted a new request: <em>{event.requestTitle}</em></>
                      )}
                      {event.type === 'MEMBER_JOINED' && (
                        <><strong>{event.userName}</strong> joined the neighborhood helpers</>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-gray mt-0.5">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Completed */}
          <div className="bg-white border border-nbrly-border rounded-panel p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray pb-2 border-b border-nbrly-border">
              RECENTLY COMPLETED
            </p>
            {recentlyCompleted.length > 0 ? (
              <div className="space-y-2">
                {recentlyCompleted.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2 px-2 hover:bg-paper/50 rounded-button transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-charcoal">{req.title}</p>
                        <p className="text-[10px] text-muted-gray">{req.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-success-green">✓ Completed</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-gray">No completed helps yet — be the first!</p>
              </div>
            )}

            {/* Placeholder completed items from community */}
            {recentlyCompleted.length === 0 && (
              <div className="space-y-2 pt-2 border-t border-nbrly-border">
                {[
                  { title: 'Medicine pickup', cat: 'Healthcare' },
                  { title: 'Laptop setup', cat: 'Technology' },
                  { title: 'Grocery assistance', cat: 'Errands' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-charcoal">{item.title}</p>
                        <p className="text-[10px] text-muted-gray">{item.cat}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-success-green">✓ Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: NEARBY HELP REQUESTS GRID */}
      <section className="py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-nbrly-border">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray block mb-1">
              NEARBY REQUESTS
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-charcoal">
              Someone nearby could use a hand.
            </h2>
            <p className="text-sm text-muted-gray font-sans mt-1">
              Find a request you can help with in Bandra West & nearby streets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/explore">
              <Button variant="secondary" size="sm">
                EXPLORE ALL <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.slice(0, 6).map((req) => (
            <RequestCard 
              key={req.id} 
              request={req} 
              onCardClick={(r: HelpRequest) => navigate(`/request/${r.id}`)}
              onHelpClick={(r: HelpRequest) => navigate(`/request/${r.id}`)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 5: HOW NBRLY WORKS */}
      <section id="how-it-works" className="py-8 border-y border-nbrly-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gray font-sans block mb-1">
            SIMPLE & TRUSTED
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal">
            HOW NBRLY WORKS
          </h2>
          <p className="mt-2 text-muted-gray font-sans text-sm">
            Three straightforward steps to build a closer neighborhood.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-nbrly-border -translate-y-6 z-0" />

          <div className="bg-white border border-nbrly-border rounded-panel p-6 relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-charcoal text-white rounded-button flex items-center justify-center font-extrabold font-heading text-sm">
                01
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">ASK</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-charcoal">Post what you need.</h3>
            <p className="text-sm text-muted-gray font-sans leading-relaxed">
              Describe your task, set the urgency level, and specify your preferred time window. From pharmacy runs to tech setup.
            </p>
          </div>

          <div className="bg-white border border-nbrly-border rounded-panel p-6 relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-lime text-charcoal rounded-button flex items-center justify-center font-extrabold font-heading text-sm border border-charcoal/10">
                02
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">MATCH</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-charcoal">Find a nearby neighbor.</h3>
            <p className="text-sm text-muted-gray font-sans leading-relaxed">
              Smart NeighborMatch scores prioritize requests based on proximity, skills alignment, and schedule availability.
            </p>
          </div>

          <div className="bg-white border border-nbrly-border rounded-panel p-6 relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-charcoal text-white rounded-button flex items-center justify-center font-extrabold font-heading text-sm">
                03
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">HELP</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-charcoal">Lend a hand & build trust.</h3>
            <p className="text-sm text-muted-gray font-sans leading-relaxed">
              Click "I Can Help" to lock the request, complete the task, and earn community trust ratings and badges.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6: COMMUNITY CTA */}
      <section className="py-8">
        <div className="bg-white border border-nbrly-border rounded-panel p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-lifted relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray block">
              NEIGHBORHOOD ACTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-charcoal uppercase tracking-tight leading-tight">
              YOUR NEIGHBORHOOD IS FULL OF PEOPLE WHO CAN HELP.
            </h2>
            <p className="text-base text-muted-gray font-sans">
              Sometimes all it takes is asking. Post your request or offer a hand today.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/create">
                <Button variant="lime" size="lg" className="shadow-md">
                  CREATE A REQUEST <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="secondary" size="lg">
                  BROWSE NEARBY HELP
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
