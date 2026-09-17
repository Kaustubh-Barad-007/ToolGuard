import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getToolGuardTheme = (mode: 'dark' | 'light' = 'light') => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0A0E1A' : '#FAFBFE',
        paper: isDark ? '#111827' : '#FFFFFF'
      },
      primary: {
        main: isDark ? '#00D4AA' : '#008B72',
        light: '#00D4AA',
        dark: '#006B5A',
        contrastText: '#ffffff'
      },
      secondary: {
        main: isDark ? '#7C5CFC' : '#5B3FD4',
        light: '#9B82FF',
        dark: '#4A2FB3',
        contrastText: '#ffffff'
      },
      success: {
        main: isDark ? '#00D4AA' : '#008B72',
        light: '#33DDBB',
        dark: '#006B5A',
        contrastText: '#ffffff'
      },
      warning: {
        main: isDark ? '#FFB340' : '#CC8A1E',
        light: '#FFC96B',
        dark: '#A06D0F',
        contrastText: '#ffffff'
      },
      error: {
        main: isDark ? '#FF4D6A' : '#D63051',
        light: '#FF7A91',
        dark: '#B01E3C',
        contrastText: '#ffffff'
      },
      divider: isDark ? '#1C2333' : '#E5E9F2',
      text: {
        primary: isDark ? '#F0F2F8' : '#0D1117',
        secondary: isDark ? '#6B7A99' : '#5A6578',
        disabled: isDark ? '#3D4A63' : '#9AA3B4'
      }
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.035em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 750, letterSpacing: '-0.025em' },
      h4: { fontWeight: 750, letterSpacing: '-0.025em' },
      h5: { fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontWeight: 700, letterSpacing: '-0.015em' },
      subtitle1: { fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 650, letterSpacing: '-0.005em' },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.55 },
      button: { textTransform: 'none', fontWeight: 650, fontSize: '0.8125rem' }
    },
    shape: {
      borderRadius: 10
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@keyframes statusPulse': {
            '0%': { transform: 'scale(1)', opacity: 0.95 },
            '50%': { transform: 'scale(1.15)', opacity: 0.65 },
            '100%': { transform: 'scale(1)', opacity: 0.95 }
          },
          '@keyframes shimmerScan': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          },
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(3px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          body: {
            backgroundColor: isDark ? '#0A0E1A' : '#FAFBFE',
            backgroundImage: 'none',
            color: isDark ? '#F0F2F8' : '#0D1117',
            scrollbarColor: isDark ? '#1C2333 #0A0E1A' : '#CBD5E1 #FAFBFE',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 6,
              height: 6
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 3,
              backgroundColor: isDark ? '#263147' : '#CBD5E1'
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
            fontWeight: 650,
            textTransform: 'none',
            fontSize: '0.8125rem',
            letterSpacing: '-0.005em',
            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-0.5px)'
            },
            '&:active': {
              transform: 'scale(0.98)'
            }
          },
          containedPrimary: {
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#059669',
              boxShadow: 'none'
            }
          },
          outlined: {
            borderColor: isDark ? '#1C2333' : '#E5E9F2',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            color: isDark ? '#F0F2F8' : '#0D1117',
            boxShadow: 'none',
            '&:hover': {
              borderColor: isDark ? '#2D3A52' : '#CBD5E1',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? '#1C2333' : '#E5E9F2',
            boxShadow: 'none'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? '#1C2333' : '#F1F3F9'}`,
            padding: '11px 15px',
            fontSize: '0.82rem'
          },
          head: {
            fontWeight: 750,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: isDark ? '#6B7A99' : '#5A6578',
            backgroundColor: isDark ? '#0C1020' : '#F7F8FC',
            borderBottom: `1px solid ${isDark ? '#1C2333' : '#E5E9F2'}`
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 650,
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
