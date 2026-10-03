import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowRight, Lock, Mail, User as UserIcon, MapPin, AlertCircle, Plus } from 'lucide-react';

const COMMON_SKILLS = [
  'Technology',
  'Smartphone Setup',
  'Computer Help',
  'Grocery / Errands',
  'Healthcare / Medicine',
  'Education / Tutoring',
  'Household Repair',
  'Elderly Assistance',
  'Pet Care',
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>(['Technology', 'Errands']);
  const [customSkill, setCustomSkill] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        neighborhood,
        bio: bio || 'Local resident happy to lend a hand in the neighborhood.',
        skills,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime/30 text-charcoal border border-lime/60 rounded-full text-xs font-semibold uppercase tracking-wider font-sans mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-lime border border-charcoal/20" />
          JOIN COMMUNITY
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal tracking-tight">
          JOIN NBRLY
        </h1>
        <p className="text-sm text-muted-gray font-sans">
          Connect with neighbors and start helping next door.
        </p>
      </div>

      <Card className="p-6 sm:p-8 shadow-lifted space-y-6 bg-white border border-nbrly-border rounded-panel">
        
        {error && (
          <div className="p-3 bg-red-50 border border-urgent-red/30 rounded-button text-xs text-urgent-red flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Bandra West, Mumbai"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
            <p className="text-[11px] text-muted-gray mt-1">Enter your neighborhood or area (e.g. Bandra West, Andheri East, Powai, Thane West).</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block mb-1.5">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. IT student who enjoys helping neighbors with technology and errands."
              className="w-full px-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans resize-none"
            />
          </div>

          {/* Skills Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block">
              What can you help neighbors with?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-button border transition-all ${
                      selected
                        ? 'bg-lime text-charcoal border-charcoal/30'
                        : 'bg-paper text-muted-gray border-nbrly-border hover:text-charcoal'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{skill}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                placeholder="Other skill..."
                className="flex-1 px-3 py-1.5 text-xs border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal font-sans"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomSkill}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            variant="lime"
            size="lg"
            disabled={loading}
            className="w-full shadow-md mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-charcoal border-t-transparent animate-spin" />
                CREATING ACCOUNT...
              </span>
            ) : (
              <>
                CREATE NEIGHBOR ACCOUNT <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </Button>

        </form>

        <div className="text-center pt-2 border-t border-nbrly-border">
          <p className="text-xs text-muted-gray font-sans">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-charcoal hover:underline">
              Log in here →
            </Link>
          </p>
        </div>

      </Card>
    </div>
  );
};
