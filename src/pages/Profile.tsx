import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests, DEMO_USERS } from '../context/RequestContext';
import { BADGE_DEFINITIONS, mockReviews } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { User, Review } from '../types';
import {
  MapPin, Star, ArrowLeft, Calendar, Edit3, X, Plus,
  HeartHandshake, Users, Zap, Award, Lock,
} from 'lucide-react';

// ─── Rating Distribution Bar ────────────────────────────────
const RatingDistribution: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
  });
  const max = Math.max(...dist, 1);

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2 text-xs font-sans">
          <span className="w-8 text-right font-semibold text-charcoal">{star} ★</span>
          <div className="flex-1 h-2 bg-paper rounded-full border border-nbrly-border overflow-hidden">
            <div
              className="h-full bg-lime rounded-full transition-all duration-500"
              style={{ width: `${(dist[star - 1] / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-muted-gray font-medium">{dist[star - 1]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Badge Icon Helper ────────────────────────────────
const BadgeIcon: React.FC<{ icon: string; earned: boolean }> = ({ icon, earned }) => {
  const cls = `w-4 h-4 ${earned ? 'text-charcoal' : 'text-muted-gray'}`;
  switch (icon) {
    case 'HeartHandshake': return <HeartHandshake className={cls} />;
    case 'Users': return <Users className={cls} />;
    case 'Zap': return <Zap className={cls} />;
    case 'Award': return <Award className={cls} />;
    case 'Star': return <Star className={cls} />;
    default: return <Award className={cls} />;
  }
};

// ─── Edit Profile Modal ────────────────────────────────
const EditProfileModal: React.FC<{
  user: User;
  onSave: (updates: Partial<User>) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [neighborhood, setNeighborhood] = useState(user.neighborhood);
  const [skills, setSkills] = useState<string[]>([...user.skills]);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = () => {
    onSave({ name, bio, neighborhood, skills });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-nbrly-border rounded-panel max-w-lg w-full p-6 shadow-lifted space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-charcoal">EDIT PROFILE</h2>
          <button onClick={onClose} className="p-1 hover:bg-paper rounded-button transition-colors">
            <X className="w-5 h-5 text-charcoal" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">Neighborhood</label>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-paper text-charcoal text-xs font-semibold rounded-button border border-nbrly-border">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-urgent-red transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-1.5 text-xs border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSkill}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-nbrly-border">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="lime" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Page ────────────────────────────────
export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUser, activities } = useRequests();
  const [editOpen, setEditOpen] = useState(false);

  // Determine if viewing own profile or another user
  const isOwnProfile = !id || id === currentUser.id;
  let user: User;

  if (isOwnProfile) {
    user = currentUser;
  } else {
    const found = DEMO_USERS.find((u) => u.id === id);
    if (!found) {
      return (
        <div className="text-center py-20 space-y-4">
          <p className="text-xl font-bold font-heading text-charcoal">NEIGHBOR NOT FOUND</p>
          <p className="text-sm text-muted-gray">This profile doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      );
    }
    user = { ...found, badges: BADGE_DEFINITIONS.filter((b) => {
      switch (b.id) {
        case 'bdg_01': return found.completedHelps >= 1;
        case 'bdg_02': return found.completedHelps >= 5;
        case 'bdg_03': return found.completedHelps >= 1;
        case 'bdg_04': return found.completedHelps >= 10;
        case 'bdg_05': return found.rating >= 4.8 && found.completedHelps >= 10;
        default: return false;
      }
    }).map((b) => ({ ...b, earnedAt: '2026-09-01' })) };
  }

  // Reviews — use stored reviews or mock
  const reviews: Review[] = user.reviews || mockReviews;

  // Trust calculations
  const completedCount = user.completedHelps;
  const acceptedTotal = completedCount + activities.filter((a) => a.role === 'helping' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length;
  const completionRate = acceptedTotal > 0 ? Math.round((completedCount / acceptedTotal) * 100) : 100;
  const peopleHelped = Math.max(completedCount - 5, completedCount); // Slightly different metric

  return (
    <div className="space-y-8 pb-12">

      {/* Back link for public profiles */}
      {!isOwnProfile && (
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-gray hover:text-charcoal transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
      )}

      {/* ─── PROFILE HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-nbrly-border">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-charcoal tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs font-semibold text-muted-gray flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {user.neighborhood}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-charcoal">
                <Star className="w-4 h-4 fill-lime text-charcoal" /> {user.rating}
              </span>
              <span className="w-px h-4 bg-nbrly-border" />
              <span className="text-xs font-semibold text-charcoal">{user.completedHelps} helps</span>
              <span className="w-px h-4 bg-nbrly-border" />
              <span className="text-xs font-semibold text-charcoal">{user.createdHelpsCount} requests</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success-green">
                <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                ACTIVE NEIGHBOR
              </span>
              <span className="text-[11px] text-muted-gray flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Member since {user.joinedAt || 'Aug 2026'}
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Edit3 className="w-3.5 h-3.5" /> EDIT PROFILE
          </Button>
        )}
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-8">

          {/* About */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">ABOUT</h2>
            <p className="text-sm text-charcoal/85 font-sans leading-relaxed">{user.bio}</p>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">WHAT I CAN HELP WITH</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-white text-charcoal text-xs font-semibold rounded-button border border-nbrly-border hover:border-charcoal/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setEditOpen(true)}
                className="text-[11px] font-semibold text-muted-gray hover:text-charcoal transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add skill
              </button>
            )}
          </div>

          {/* Community Badges */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">COMMUNITY BADGES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BADGE_DEFINITIONS.map((def) => {
                const earned = user.badges.some((b) => b.id === def.id);
                return (
                  <div
                    key={def.id}
                    className={`p-3 rounded-button border transition-all ${
                      earned
                        ? 'bg-white border-lime hover:border-charcoal/30'
                        : 'bg-paper border-nbrly-border opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        earned ? 'bg-lime border border-charcoal/10' : 'bg-nbrly-border'
                      }`}>
                        {earned ? <BadgeIcon icon={def.icon} earned={true} /> : <Lock className="w-3.5 h-3.5 text-muted-gray" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold font-heading uppercase tracking-wide ${earned ? 'text-charcoal' : 'text-muted-gray'}`}>
                          {earned ? '✓ ' : '○ '}{def.name}
                        </p>
                        <p className="text-[10px] text-muted-gray leading-snug mt-0.5">{def.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-8">

          {/* Trust & Reputation */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">TRUST & REPUTATION</h2>
            <div className="bg-white border border-nbrly-border rounded-panel p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-nbrly-border">
                <div className="pt-4 sm:pt-0">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal tracking-tighter block">{user.rating}</span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray mt-1">Average Rating</p>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal tracking-tighter block">{user.completedHelps}</span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray mt-1">Helps Completed</p>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal tracking-tighter block">{peopleHelped}</span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray mt-1">People Helped</p>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading text-lime-600 tracking-tighter block">{completionRate}%</span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-gray mt-1">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">RATING BREAKDOWN</h2>
            <Card className="!p-4">
              <RatingDistribution reviews={reviews} />
            </Card>
          </div>

          {/* What Neighbors Say */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-gray">
              WHAT NEIGHBORS SAY ({reviews.length})
            </h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-nbrly-border rounded-button p-4 space-y-2 hover:border-charcoal/20 transition-colors"
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-lime text-charcoal' : 'text-nbrly-border'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-charcoal font-sans leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar src={review.reviewerAvatar} name={review.reviewerName} size="sm" />
                    <div className="text-xs">
                      <span className="font-semibold text-charcoal">— {review.reviewerName}</span>
                      <span className="text-muted-gray ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          user={currentUser}
          onSave={updateUser}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
};
