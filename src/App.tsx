import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RequestProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </RequestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
