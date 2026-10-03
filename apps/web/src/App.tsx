import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { DemoDataProvider } from './context/DemoDataContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <BrowserRouter>
        <DemoDataProvider>
          <AppRoutes />
        </DemoDataProvider>
      </BrowserRouter>
    </ThemeModeProvider>
  );
};
