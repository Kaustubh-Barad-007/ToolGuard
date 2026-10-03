import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [failOn, setFailOn] = useState('high');
  const [scanFreq, setScanFreq] = useState('2500');
  const [vscodeNotify, setVscodeNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const border    = isDark ? '#2E2E2E' : '#E5E7EB';
  const surface   = isDark ? '#1C1C1C' : '#FFFFFF';
  const surfaceBg = isDark ? '#171717' : '#F9FAFB';
  const accent    = isDark ? '#3ECF8E' : '#00C475';
  const textMuted = isDark ? '#9E9E9E' : '#6B7280';

  const SettingRow = ({
    label,
    description,
    control,
  }: {
    label: string;
    description: string;
    control: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        '&:not(:last-child)': { borderBottom: `1px solid ${border}` },
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.86rem', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.78rem', lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: textMuted, mt: 0.25 }}>
          Configure how ToolGuard monitors and alerts your workspace.
        </Typography>
      </Box>

      {/* Save success */}
      {saved && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.84rem', border: `1px solid ${isDark ? 'rgba(62,207,142,0.3)' : '#A7F3D0'}`, backgroundColor: isDark ? 'rgba(62,207,142,0.08)' : '#ECFDF5' }}
        >
          Preferences saved successfully.
        </Alert>
      )}

      {/* Security Policy */}
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 2, borderRadius: '8px', backgroundColor: surface, borderColor: border }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
          <PolicyOutlinedIcon sx={{ color: accent, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem' }}>
              Security Policy
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Rules for when ToolGuard should alert and block pipelines
            </Typography>
          </Box>
        </Box>

        <SettingRow
          label="CI gate — fail on severity"
          description="ToolGuard will fail your CI/CD pipeline if a tool drift reaches this severity level."
          control={
            <Select
              size="small"
              value={failOn}
              onChange={(e) => setFailOn(e.target.value)}
              sx={{
                minWidth: 220,
                borderRadius: '7px',
                fontSize: '0.82rem',
                backgroundColor: surfaceBg,
                '& fieldset': { borderColor: border },
              }}
            >
              <MenuItem value="high" sx={{ fontSize: '0.82rem' }}>🔴 High severity only</MenuItem>
              <MenuItem value="medium" sx={{ fontSize: '0.82rem' }}>🟠 Medium & high severity</MenuItem>
              <MenuItem value="low" sx={{ fontSize: '0.82rem' }}>🟡 Any change (strict)</MenuItem>
            </Select>
          }
        />

        <SettingRow
          label="Background scan interval"
          description="How often ToolGuard silently re-scans your project in the background."
          control={
            <Select
              size="small"
              value={scanFreq}
              onChange={(e) => setScanFreq(e.target.value)}
              sx={{
                minWidth: 220,
                borderRadius: '7px',
                fontSize: '0.82rem',
                backgroundColor: surfaceBg,
                '& fieldset': { borderColor: border },
              }}
            >
              <MenuItem value="2500" sx={{ fontSize: '0.82rem' }}>Every 2.5 seconds (real-time)</MenuItem>
              <MenuItem value="5000" sx={{ fontSize: '0.82rem' }}>Every 5 seconds (standard)</MenuItem>
              <MenuItem value="10000" sx={{ fontSize: '0.82rem' }}>Every 10 seconds</MenuItem>
              <MenuItem value="manual" sx={{ fontSize: '0.82rem' }}>Manual only</MenuItem>
            </Select>
          }
        />
      </Paper>

      {/* Notifications */}
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 3, borderRadius: '8px', backgroundColor: surface, borderColor: border }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
          <NotificationsOutlinedIcon sx={{ color: accent, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem' }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Control how ToolGuard alerts you about drift events
            </Typography>
          </Box>
        </Box>

        <SettingRow
          label="IDE status bar alerts"
          description="Show real-time drift alerts in the VS Code, Cursor, and Windsurf status bar."
          control={
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={vscodeNotify}
                  onChange={(e) => setVscodeNotify(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accent },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.82rem', ml: 0.5 }}>
                  {vscodeNotify ? 'On' : 'Off'}
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          }
        />
      </Paper>

      {/* Save */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 17 }} />}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.88rem',
          borderRadius: '8px',
          py: 1.1,
          backgroundColor: accent,
          color: isDark ? '#121212' : '#FFFFFF',
          boxShadow: 'none',
          '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
        }}
      >
        Save Preferences
      </Button>
    </Box>
  );
};
