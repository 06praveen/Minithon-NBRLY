import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('nbrly123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime/30 text-charcoal border border-lime/60 rounded-full text-xs font-semibold uppercase tracking-wider font-sans mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-lime border border-charcoal/20" />
          NEIGHBOR ACCESS
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal tracking-tight">
          WELCOME BACK
        </h1>
        <p className="text-sm text-muted-gray font-sans">
          Log in to your NBRLY neighborhood account.
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-gray block">
                Password
              </label>
              <span className="text-[11px] text-muted-gray hover:text-charcoal cursor-pointer">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-gray absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-nbrly-border rounded-button bg-paper text-charcoal focus:outline-none focus:border-charcoal transition-colors font-sans"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="lime"
            size="lg"
            disabled={loading}
            className="w-full shadow-md mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-charcoal border-t-transparent animate-spin" />
                SIGNING IN...
              </span>
            ) : (
              <>
                SIGN IN <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </Button>

        </form>

        {/* Quick Demo Autofill */}
        <div className="pt-4 border-t border-nbrly-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-gray">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-charcoal" /> Quick Demo Accounts
            </span>
            <span className="font-mono text-[10px] text-muted-gray">pwd: nbrly123</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('aarav.sharma@example.com')}
              className="px-2 py-1.5 text-xs bg-paper hover:bg-lime/20 border border-nbrly-border rounded-button text-charcoal font-semibold text-center transition-colors truncate"
            >
              Aarav
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('rohan.mehta@example.com')}
              className="px-2 py-1.5 text-xs bg-paper hover:bg-lime/20 border border-nbrly-border rounded-button text-charcoal font-semibold text-center transition-colors truncate"
            >
              Rohan
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('priya.shah@example.com')}
              className="px-2 py-1.5 text-xs bg-paper hover:bg-lime/20 border border-nbrly-border rounded-button text-charcoal font-semibold text-center transition-colors truncate"
            >
              Priya
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-gray font-sans">
            New to NBRLY?{' '}
            <Link to="/register" className="font-bold text-charcoal hover:underline">
              Create a neighborhood account →
            </Link>
          </p>
        </div>

      </Card>
    </div>
  );
};
