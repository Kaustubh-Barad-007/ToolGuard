import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getToolGuardTheme = (mode: 'dark' | 'light' = 'light') => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#121212' : '#F8F9FA',
        paper: isDark ? '#1C1C1C' : '#FFFFFF'
      },
      primary: {
        main: isDark ? '#3ECF8E' : '#00C475',
        light: isDark ? '#5FE3A1' : '#3ECF8E',
        dark: isDark ? '#24B47E' : '#059669',
        contrastText: isDark ? '#121212' : '#FFFFFF'
      },
      secondary: {
        main: isDark ? '#3ECF8E' : '#00C475',
        light: isDark ? '#5FE3A1' : '#3ECF8E',
        dark: isDark ? '#24B47E' : '#059669',
        contrastText: isDark ? '#121212' : '#FFFFFF'
      },
      success: {
        main: isDark ? '#3ECF8E' : '#059669',
        light: '#5FE3A1',
        dark: '#24B47E',
        contrastText: isDark ? '#121212' : '#FFFFFF'
      },
      warning: {
        main: isDark ? '#F5A623' : '#D97706',
        light: '#FBBF24',
        dark: '#B45309',
        contrastText: '#FFFFFF'
      },
      error: {
        main: isDark ? '#FA5252' : '#DC2626',
        light: '#F87171',
        dark: '#B91C1C',
        contrastText: '#FFFFFF'
      },
      info: {
        main: isDark ? '#3E7BFA' : '#2563EB',
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF'
      },
      divider: isDark ? '#2E2E2E' : '#E5E7EB',
      text: {
        primary: isDark ? '#EDEDED' : '#111827',
        secondary: isDark ? '#9E9E9E' : '#6B7280',
        disabled: isDark ? '#555555' : '#9CA3AF'
      }
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 650, letterSpacing: '-0.015em' },
      h6: { fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600, letterSpacing: '-0.005em' },
      subtitle2: { fontWeight: 600, letterSpacing: '-0.005em' },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.55 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@keyframes statusPulse': {
            '0%': { transform: 'scale(1)', opacity: 0.95 },
            '50%': { transform: 'scale(1.15)', opacity: 0.65 },
            '100%': { transform: 'scale(1)', opacity: 0.95 }
          },
          '@keyframes radarPing': {
            '0%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.3)', opacity: 0.4 },
            '100%': { transform: 'scale(1)', opacity: 1 }
          },
          '@keyframes shimmerScan': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          },
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(2px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          body: {
            backgroundColor: isDark ? '#121212' : '#F8F9FA',
            backgroundImage: 'none',
            color: isDark ? '#EDEDED' : '#111827',
            scrollbarColor: isDark ? '#2E2E2E #121212' : '#D1D5DB #F8F9FA',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 6,
              height: 6
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 3,
              backgroundColor: isDark ? '#2E2E2E' : '#D1D5DB'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '6px 14px',
            boxShadow: 'none',
            fontWeight: 600,
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
            backgroundColor: isDark ? '#3ECF8E' : '#00C475',
            color: isDark ? '#121212' : '#FFFFFF',
            border: `1px solid ${isDark ? '#3ECF8E' : '#00C475'}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: isDark ? '#34B27B' : '#059669',
              boxShadow: 'none'
            }
          },
          outlined: {
            borderColor: isDark ? '#2E2E2E' : '#E5E7EB',
            backgroundColor: isDark ? 'transparent' : '#FFFFFF',
            color: isDark ? '#EDEDED' : '#111827',
            boxShadow: 'none',
            '&:hover': {
              borderColor: isDark ? '#404040' : '#D1D5DB',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F9FAFB',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
            borderColor: isDark ? '#2E2E2E' : '#E5E7EB',
            boxShadow: 'none'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? '#242424' : '#F3F4F6'}`,
            padding: '11px 16px',
            fontSize: '0.8125rem'
          },
          head: {
            fontWeight: 650,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#9E9E9E' : '#6B7280',
            backgroundColor: isDark ? '#171717' : '#F9FAFB',
            borderBottom: `1px solid ${isDark ? '#2E2E2E' : '#E5E7EB'}`
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
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.8125rem',
            backgroundColor: isDark ? '#171717' : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#2E2E2E' : '#E5E7EB'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#404040' : '#D1D5DB'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#3ECF8E' : '#00C475',
              borderWidth: 1.5
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: isDark ? '#3ECF8E' : '#00C475',
            height: 2
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: isDark ? '#9E9E9E' : '#6B7280',
            '&.Mui-selected': {
              color: isDark ? '#3ECF8E' : '#00C475',
              fontWeight: 600
            }
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
};
