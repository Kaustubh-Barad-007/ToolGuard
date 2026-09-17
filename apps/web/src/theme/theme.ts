import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getToolGuardTheme = (mode: 'dark' | 'light' = 'dark') => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0d1117' : '#f6f8fa',
        paper: isDark ? '#161b22' : '#ffffff'
      },
      primary: {
        main: '#10b981', // ToolGuard emerald green
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      secondary: {
        main: isDark ? '#58a6ff' : '#0969da',
        light: '#79c0ff',
        dark: '#1f6feb',
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
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff'
      },
      divider: isDark ? '#30363d' : '#d0d7de',
      text: {
        primary: isDark ? '#f0f6fc' : '#1f2328',
        secondary: isDark ? '#8b949e' : '#656d76',
        disabled: isDark ? '#484f58' : '#8c959f'
      }
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 650, letterSpacing: '-0.015em' },
      h4: { fontWeight: 650, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '0.875rem', lineHeight: 1.5 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }
    },
    shape: {
      borderRadius: 6
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0d1117' : '#f6f8fa',
            scrollbarColor: isDark ? '#30363d #0d1117' : '#d0d7de #f6f8fa',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: isDark ? '#30363d' : '#d0d7de'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '5px 14px',
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.8125rem',
            '&:hover': {
              boxShadow: 'none'
            }
          },
          containedPrimary: {
            backgroundColor: '#10b981',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#059669',
              boxShadow: 'none'
            }
          },
          outlined: {
            borderColor: isDark ? '#30363d' : '#d0d7de',
            color: isDark ? '#f0f6fc' : '#1f2328',
            '&:hover': {
              borderColor: isDark ? '#8b949e' : '#656d76',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#161b22' : '#ffffff',
            borderColor: isDark ? '#30363d' : '#d0d7de'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
            padding: '10px 14px',
            fontSize: '0.8125rem'
          },
          head: {
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: isDark ? '#8b949e' : '#656d76',
            backgroundColor: isDark ? '#0d1117' : '#f6f8fa'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 22,
            borderRadius: 6
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
};
