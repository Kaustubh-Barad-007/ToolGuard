import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getToolGuardTheme = (mode: 'dark' | 'light' = 'dark') => {
  const isDark = mode === 'dark';

  let theme = createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#080b11' : '#f8fafc',
        paper: isDark ? '#0e131f' : '#ffffff'
      },
      primary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#8b5cf6', // Violet accent
        light: '#a78bfa',
        dark: '#6d28d9',
        contrastText: '#ffffff'
      },
      success: {
        main: '#10b981', // Emerald SAFE
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      warning: {
        main: '#f59e0b', // Amber REVIEW
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff'
      },
      error: {
        main: '#ef4444', // Crimson HIGH RISK
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff'
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)',
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b'
      }
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 750, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 650, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 550, letterSpacing: '-0.005em' },
      subtitle2: { fontWeight: 550 },
      body1: { fontSize: '0.925rem', lineHeight: 1.55 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#1f293d #080b11' : '#cbd5e1 #f8fafc',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)'
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.25)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            padding: '8px 16px',
            boxShadow: 'none',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          },
          containedPrimary: {
            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            '&:hover': {
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#0e131f' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: 10,
            boxShadow: 'none',
            transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.16)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#0e131f' : '#ffffff'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
            padding: '13px 18px'
          },
          head: {
            fontWeight: 650,
            fontSize: '0.74rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#94a3b8' : '#64748b',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.02)'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 650,
            fontSize: '0.75rem',
            height: 24,
            borderRadius: 6
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
};
