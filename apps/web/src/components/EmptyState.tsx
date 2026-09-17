import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', mb: 2 }}>
        {icon || <ShieldOutlinedIcon sx={{ fontSize: 36 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ px: 3 }}>
          {actionText}
        </Button>
      )}
    </Paper>
  );
};
