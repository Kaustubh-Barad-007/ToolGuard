import React from 'react';
import { Chip, Box } from '@mui/material';
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
        icon={<CheckCircleOutlineIcon style={{ fontSize: 14 }} />}
        label={normalized === 'LOW' ? 'LOW RISK' : 'SAFE'}
        size={size}
        sx={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600,
          '& .MuiChip-icon': { color: '#10b981' }
        }}
      />
    );
  }

  if (normalized === 'REVIEW' || normalized === 'MEDIUM') {
    return (
      <Chip
        icon={<WarningAmberIcon style={{ fontSize: 14 }} />}
        label={normalized === 'MEDIUM' ? 'REVIEW (MED)' : 'REVIEW'}
        size={size}
        sx={{
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          fontWeight: 600,
          '& .MuiChip-icon': { color: '#f59e0b' }
        }}
      />
    );
  }

  // HIGH RISK
  return (
    <Chip
      icon={<ErrorOutlineIcon style={{ fontSize: 14 }} />}
      label="HIGH RISK"
      size={size}
      sx={{
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        fontWeight: 700,
        '& .MuiChip-icon': { color: '#ef4444' }
      }}
    />
  );
};
