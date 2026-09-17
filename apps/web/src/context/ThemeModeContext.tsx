import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getToolGuardTheme } from '../theme/theme';

interface ThemeModeContextType {
  mode: 'dark' | 'light';
  toggleTheme: () => void;
  setMode: (mode: 'dark' | 'light') => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('toolguard-theme-mode');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Default to ultra-premium light mode
  });

  useEffect(() => {
    localStorage.setItem('toolguard-theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setMode = (newMode: 'dark' | 'light') => {
    setModeState(newMode);
  };

  const theme = getToolGuardTheme(mode);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
