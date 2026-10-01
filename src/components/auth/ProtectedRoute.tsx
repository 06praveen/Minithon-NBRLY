import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-charcoal border-t-lime animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-gray">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
