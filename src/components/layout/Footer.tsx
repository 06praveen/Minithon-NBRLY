import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-paper border-t border-nbrly-border py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 font-heading font-bold text-xl text-charcoal tracking-tighter">
              NBRLY
              <span className="w-2 h-2 rounded-full bg-lime border border-charcoal/20" />
            </Link>
            <span className="text-xs text-muted-gray">|</span>
            <p className="text-xs text-muted-gray font-sans">
              Help starts next door. Micro-volunteering for real communities.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-gray font-medium font-sans">
            <Link to="/explore" className="hover:text-charcoal transition-colors">Explore Requests</Link>
            <Link to="/#how-it-works" className="hover:text-charcoal transition-colors">How it Works</Link>
            <Link to="/activity" className="hover:text-charcoal transition-colors">Community Pulse</Link>
            <Link to="/profile" className="hover:text-charcoal transition-colors">My Profile</Link>
          </div>

          <div className="text-xs text-muted-gray font-sans">
            © {new Date().getFullYear()} NBRLY Platform. Hackathon Build.
          </div>

        </div>
      </div>
    </footer>
  );
};
