import React from 'react';
import { useRequests } from '../../context/RequestContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useRequests();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-charcoal shrink-0" />,
    info: <Info className="w-5 h-5 text-charcoal shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-charcoal shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-lime text-charcoal border-charcoal/20',
    info: 'bg-paper text-charcoal border-nbrly-border',
    warning: 'bg-amber-300 text-charcoal border-amber-400',
    error: 'bg-urgent-red text-white border-red-700',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
      <div
        className={`flex items-center justify-between gap-3 p-4 rounded-panel shadow-lifted border ${bgStyles[toast.type]}`}
      >
        <div className="flex items-center gap-3">
          {icons[toast.type]}
          <p className="text-xs font-bold font-sans tracking-wide leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={clearToast}
          className="p-1 text-current opacity-70 hover:opacity-100 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
