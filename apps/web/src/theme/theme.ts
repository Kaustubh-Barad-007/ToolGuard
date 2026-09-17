import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getToolGuardTheme = (mode: 'dark' | 'light' = 'dark') => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff'
      },
      primary: {
        main: '#10b981', // Trustworthy emerald green (zero-trust safe)
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#6366f1', // Indigo (developer tooling / IDE)
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff'
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff'
      },
      error: {
        main: '#f43f5e', // Vivid rose/crimson for drift alert
        light: '#fb7185',
        dark: '#e11d48',
        contrastText: '#ffffff'
      },
      divider: isDark ? '#1f2937' : '#e2e8f0',
      text: {
        primary: isDark ? '#f9fafb' : '#0f172a',
        secondary: isDark ? '#9ca3af' : '#64748b',
        disabled: isDark ? '#6b7280' : '#94a3b8'
      }
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 750, letterSpacing: '-0.025em' },
      h2: { fontWeight: 750, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 650, letterSpacing: '-0.01em' },
      h6: { fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '0.875rem', lineHeight: 1.55 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
            scrollbarColor: isDark ? '#1f2937 #0b0f19' : '#cbd5e1 #f8fafc',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: isDark ? '#1f2937' : '#cbd5e1'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            padding: '6px 14px',
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.8125rem',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: 'none'
            }
          },
          containedPrimary: {
            backgroundColor: '#10b981',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#059669',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }
          },
          outlined: {
            borderColor: isDark ? '#1f2937' : '#e2e8f0',
            color: isDark ? '#f9fafb' : '#0f172a',
            '&:hover': {
              borderColor: isDark ? '#374151' : '#cbd5e1',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? '#1f2937' : '#e2e8f0'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? '#1f2937' : '#f1f5f9'}`,
            padding: '11px 16px',
            fontSize: '0.8125rem'
          },
          head: {
            fontWeight: 650,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#9ca3af' : '#64748b',
            backgroundColor: isDark ? '#0b0f19' : '#f8fafc'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: 6
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
};
