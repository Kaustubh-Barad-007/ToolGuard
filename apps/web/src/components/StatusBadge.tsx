import React from 'react';
import { Chip, Box, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
    const color = isDark ? '#00D4AA' : '#008B72';
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
          backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)',
          color: color,
          border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.3)' : 'rgba(0, 139, 114, 0.28)'}`,
          fontWeight: 750,
          letterSpacing: '0.03em',
          fontSize: '0.67rem',
          height: 22,
          borderRadius: '6px',
        }}
      />
    );
  }

  if (normalized === 'REVIEW' || normalized === 'MEDIUM') {
    const color = isDark ? '#FFB340' : '#CC8A1E';
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
          backgroundColor: isDark ? 'rgba(255, 179, 64, 0.1)' : 'rgba(204, 138, 30, 0.08)',
          color: color,
          border: `1px solid ${isDark ? 'rgba(255, 179, 64, 0.3)' : 'rgba(204, 138, 30, 0.28)'}`,
          fontWeight: 750,
          letterSpacing: '0.03em',
          fontSize: '0.67rem',
          height: 22,
          borderRadius: '6px',
        }}
      />
    );
  }

  // HIGH RISK / DRIFT DETECTED
  const color = isDark ? '#FF4D6A' : '#D63051';
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
        backgroundColor: isDark ? 'rgba(255, 77, 106, 0.12)' : 'rgba(214, 48, 81, 0.08)',
        color: color,
        border: `1px solid ${isDark ? 'rgba(255, 77, 106, 0.35)' : 'rgba(214, 48, 81, 0.3)'}`,
        fontWeight: 800,
        letterSpacing: '0.03em',
        fontSize: '0.67rem',
        height: 22,
        borderRadius: '6px',
      }}
    />
  );
};
