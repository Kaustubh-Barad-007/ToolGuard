import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { TrustStatus, RiskSeverity } from '@toolguard/shared';

interface StatusBadgeProps {
  status: TrustStatus | RiskSeverity;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const normalized = status.toUpperCase();

  if (normalized === 'SAFE' || normalized === 'LOW') {
    return (
      <Chip
        icon={<CheckCircleOutlineIcon style={{ fontSize: 13, color: '#059669' }} />}
        label={normalized === 'LOW' ? 'LOW RISK' : 'SAFE'}
        size={size}
        sx={{
          backgroundColor: 'rgba(16, 185, 129, 0.09)',
          color: '#047857',
          border: '1px solid rgba(16, 185, 129, 0.28)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          fontSize: '0.68rem',
          height: 22,
          borderRadius: '6px',
          '& .MuiChip-icon': { color: '#059669' }
        }}
      />
    );
  }

  if (normalized === 'REVIEW' || normalized === 'MEDIUM') {
    return (
      <Chip
        icon={<WarningAmberIcon style={{ fontSize: 13, color: '#d97706' }} />}
        label={normalized === 'MEDIUM' ? 'REVIEW (MED)' : 'REVIEW'}
        size={size}
        sx={{
          backgroundColor: 'rgba(245, 158, 11, 0.09)',
          color: '#b45309',
          border: '1px solid rgba(245, 158, 11, 0.28)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          fontSize: '0.68rem',
          height: 22,
          borderRadius: '6px',
          '& .MuiChip-icon': { color: '#d97706' }
        }}
      />
    );
  }

  // HIGH RISK
  return (
    <Chip
      icon={<ErrorOutlineIcon style={{ fontSize: 13, color: '#e11d48' }} />}
      label="HIGH RISK"
      size={size}
      sx={{
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        color: '#be123c',
        border: '1px solid rgba(244, 63, 94, 0.28)',
        fontWeight: 750,
        letterSpacing: '0.02em',
        fontSize: '0.68rem',
        height: 22,
        borderRadius: '6px',
        '& .MuiChip-icon': { color: '#e11d48' }
      }}
    />
  );
};
