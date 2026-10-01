import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MapPinOff, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 my-12">
      <div className="w-16 h-16 bg-lime/30 border border-lime text-charcoal rounded-full flex items-center justify-center mb-6">
        <MapPinOff className="w-8 h-8 text-charcoal" />
      </div>
      
      <span className="text-xs font-bold uppercase tracking-widest text-muted-gray mb-2 font-sans">
        404 — OFF THE MAP
      </span>
      
      <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-charcoal mb-4">
        Looks like this page wandered outside the neighborhood.
      </h1>
      
      <p className="text-sm text-muted-gray max-w-md font-sans mb-8 leading-relaxed">
        The request or page you are looking for doesn't exist or has been moved to another street.
      </p>

      <Link to="/">
        <Button variant="lime">
          <ArrowLeft className="w-4 h-4" /> BACK TO NBRLY
        </Button>
      </Link>
    </div>
  );
};
