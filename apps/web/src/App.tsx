import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { DemoDataProvider } from './context/DemoDataContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <DemoDataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DemoDataProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
};
