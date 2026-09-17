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
            '0%': { transform: 'scale(0.95)', opacity: 0.95 },
            '50%': { transform: 'scale(1.3)', opacity: 0.4 },
            '100%': { transform: 'scale(0.95)', opacity: 0.95 }
          },
          body: {
            backgroundColor: isDark ? '#0A0E1A' : '#FAFBFE',
            backgroundImage: isDark
              ? 'none'
              : 'radial-gradient(at 15% 0%, rgba(0, 212, 170, 0.04) 0px, transparent 40%), radial-gradient(at 85% 0%, rgba(124, 92, 252, 0.035) 0px, transparent 40%), #FAFBFE',
            backgroundAttachment: 'fixed',
            color: isDark ? '#F0F2F8' : '#0D1117',
            scrollbarColor: isDark ? '#1C2333 #0A0E1A' : '#CBD5E1 #FAFBFE',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 7,
              height: 7
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: isDark ? '#1C2333' : '#CBD5E1'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '7px 16px',
            boxShadow: 'none',
            fontWeight: 650,
            textTransform: 'none',
            fontSize: '0.8125rem',
            letterSpacing: '-0.005em',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #00D4AA 0%, #008B72 100%)'
              : 'linear-gradient(135deg, #00C49A 0%, #008B72 100%)',
            color: '#ffffff',
            boxShadow: isDark
              ? '0 2px 12px rgba(0, 212, 170, 0.3)'
              : '0 2px 10px rgba(0, 139, 114, 0.25)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #00B896 0%, #006B5A 100%)'
                : 'linear-gradient(135deg, #008B72 0%, #006B5A 100%)',
              boxShadow: isDark
                ? '0 4px 18px rgba(0, 212, 170, 0.4)'
                : '0 4px 14px rgba(0, 139, 114, 0.35)'
            }
          },
          outlined: {
            borderColor: isDark ? '#1C2333' : '#E5E9F2',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            color: isDark ? '#F0F2F8' : '#0D1117',
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(13, 17, 23, 0.03)',
            '&:hover': {
              borderColor: isDark ? '#2D3A52' : '#C8CED9',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F7F8FC',
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(13, 17, 23, 0.05)'
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
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.45)'
              : '0 1px 3px rgba(13, 17, 23, 0.03), 0 6px 18px -3px rgba(13, 17, 23, 0.05)'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? '#1C2333' : '#F1F3F9'}`,
            padding: '12px 16px',
            fontSize: '0.82rem'
          },
          head: {
            fontWeight: 750,
            fontSize: '0.7rem',
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
            fontSize: '0.72rem',
            height: 24,
            borderRadius: 7
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
};
