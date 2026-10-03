import React from 'react';
import { Chip, Box, useTheme } from '@mui/material';
import { TrustStatus, RiskSeverity } from '@toolguard/shared';

interface StatusBadgeProps {
  status: TrustStatus | RiskSeverity;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const normalized = status.toUpperCase();

  if (normalized === 'SAFE' || normalized === 'LOW') {
    const color = isDark ? '#3ECF8E' : '#00C475';
    return (
      <Chip
        icon={
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
                mr: 0.5,
              }}
            />
          </Box>
        }
        label={normalized === 'LOW' ? 'LOW RISK' : 'SAFE (VERIFIED)'}
        size={size}
        sx={{
          backgroundColor: isDark ? 'rgba(62, 207, 142, 0.12)' : 'rgba(0, 196, 117, 0.08)',
          color: color,
          border: `1px solid ${isDark ? 'rgba(62, 207, 142, 0.3)' : 'rgba(0, 196, 117, 0.25)'}`,
          fontWeight: 650,
          letterSpacing: '0.03em',
          fontSize: '0.68rem',
          height: 22,
          borderRadius: '6px',
        }}
      />
    );
  }

  if (normalized === 'REVIEW' || normalized === 'MEDIUM') {
    const color = isDark ? '#F5A623' : '#D97706';
    return (
      <Chip
        icon={
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
                mr: 0.5,
              }}
            />
          </Box>
        }
        label={normalized === 'MEDIUM' ? 'REVIEW (MED)' : 'NEEDS REVIEW'}
        size={size}
        sx={{
          backgroundColor: isDark ? 'rgba(245, 166, 35, 0.12)' : 'rgba(217, 119, 6, 0.08)',
          color: color,
          border: `1px solid ${isDark ? 'rgba(245, 166, 35, 0.3)' : 'rgba(217, 119, 6, 0.25)'}`,
          fontWeight: 650,
          letterSpacing: '0.03em',
          fontSize: '0.68rem',
          height: 22,
          borderRadius: '6px',
        }}
      />
    );
  }

  // HIGH RISK / DRIFT DETECTED
  const color = isDark ? '#FA5252' : '#DC2626';
  return (
    <Chip
      icon={
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
              mr: 0.5,
              animation: 'radarPing 1.8s infinite',
            }}
          />
        </Box>
      }
      label="HIGH RISK (DRIFT)"
      size={size}
      sx={{
        backgroundColor: isDark ? 'rgba(250, 82, 82, 0.12)' : 'rgba(220, 38, 38, 0.08)',
        color: color,
        border: `1px solid ${isDark ? 'rgba(250, 82, 82, 0.35)' : 'rgba(220, 38, 38, 0.25)'}`,
        fontWeight: 700,
        letterSpacing: '0.03em',
        fontSize: '0.68rem',
        height: 22,
        borderRadius: '6px',
      }}
    />
  );
};
