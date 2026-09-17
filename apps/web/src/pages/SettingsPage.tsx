import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { useDemoData } from '../context/DemoDataContext';

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isJudgeDemoActive, loadJudgeDemo, exitJudgeDemo, resetToBaseline } = useDemoData();

  const [failOn, setFailOn] = useState('high');
  const [scanFreq, setScanFreq] = useState('5');
  const [vscodeNotify, setVscodeNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const border       = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const surface      = isDark ? '#0d1117' : '#ffffff';
  const surfaceMuted = isDark ? '#080c10' : '#f6f8fa';
  const accent       = isDark ? '#00d4aa' : '#008b72';
  const textMuted    = isDark ? '#8b949e' : '#57606a';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: textMuted, mt: 0.25 }}>
          Configure CI gate thresholds, verification intervals, and threat simulation sandboxes.
        </Typography>
      </Box>

      {saved && (
        <Alert
          severity="success"
          sx={{
            mb: 2.5,
            borderRadius: '6px',
            fontSize: '0.82rem',
          }}
        >
          Settings updated successfully.
        </Alert>
      )}

      {/* 1. Scan & CI Gate Policy */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 2.5,
          borderRadius: '10px',
          backgroundColor: surface,
          borderColor: border,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <PolicyOutlinedIcon sx={{ color: accent, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem' }}>
              Verification &amp; CI Gate Policy
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Automated rules for pipeline gating and local background checks
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, display: 'block', mb: 0.75, fontSize: '0.74rem' }}>
              CI GATE FAIL THRESHOLD
            </Typography>
            <Select
              fullWidth
              size="small"
              value={failOn}
              onChange={(e) => setFailOn(e.target.value)}
              sx={{
                borderRadius: '6px',
                fontSize: '0.82rem',
                backgroundColor: surfaceMuted,
                '& fieldset': { borderColor: border }
              }}
            >
              <MenuItem value="high" sx={{ fontSize: '0.82rem' }}>High severity alterations only</MenuItem>
              <MenuItem value="medium" sx={{ fontSize: '0.82rem' }}>Medium &amp; high severity alterations</MenuItem>
              <MenuItem value="low" sx={{ fontSize: '0.82rem' }}>Strict mode (any manifest change)</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, display: 'block', mb: 0.75, fontSize: '0.74rem' }}>
              BACKGROUND CHECK INTERVAL
            </Typography>
            <Select
              fullWidth
              size="small"
              value={scanFreq}
              onChange={(e) => setScanFreq(e.target.value)}
              sx={{
                borderRadius: '6px',
                fontSize: '0.82rem',
                backgroundColor: surfaceMuted,
                '& fieldset': { borderColor: border }
              }}
            >
              <MenuItem value="1" sx={{ fontSize: '0.82rem' }}>Every 1 minute</MenuItem>
              <MenuItem value="5" sx={{ fontSize: '0.82rem' }}>Every 5 minutes (standard)</MenuItem>
              <MenuItem value="15" sx={{ fontSize: '0.82rem' }}>Every 15 minutes</MenuItem>
              <MenuItem value="manual" sx={{ fontSize: '0.82rem' }}>Manual scan only</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Notifications & Alerts */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 2.5,
          borderRadius: '10px',
          backgroundColor: surface,
          borderColor: border,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
          <NotificationsOutlinedIcon sx={{ color: accent, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem' }}>
              Editor Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Push status notifications to the IDE status bar
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={vscodeNotify}
              onChange={(e) => setVscodeNotify(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accent }
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>
              Notify in VS Code, Cursor, and Windsurf status bar when drift is detected
            </Typography>
          }
        />
      </Paper>

      {/* Save Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '6px',
            px: 2,
            py: 0.6,
            fontSize: '0.82rem'
          }}
        >
          Save Preferences
        </Button>
      </Box>

      <Divider sx={{ borderColor: border, mb: 3 }} />

      {/* 3. Demo / Simulation Sandbox */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: '10px',
          backgroundColor: surface,
          borderColor: border,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <ScienceOutlinedIcon sx={{ color: textMuted, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem' }}>
              Simulation Sandbox
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Inject sample capability drift on local manifests for verification testing
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: textMuted, mb: 2, fontSize: '0.82rem' }}>
          Simulates an unauthorized capability expansion (e.g. network egress or admin flag) on <code>npm:dev</code>.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={loadJudgeDemo}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: '6px',
              borderColor: border,
              color: textMuted,
              px: 1.75,
              py: 0.5,
              '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
            }}
          >
            {isJudgeDemoActive ? 'Reset Simulation' : 'Launch Simulation'}
          </Button>

          {isJudgeDemoActive && (
            <Button
              variant="text"
              size="small"
              onClick={exitJudgeDemo}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.82rem',
                color: textMuted,
                '&:hover': { color: 'text.primary' }
              }}
            >
              Exit Simulation
            </Button>
          )}

          <Button
            variant="text"
            size="small"
            onClick={resetToBaseline}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.82rem',
              color: textMuted,
              '&:hover': { color: 'text.primary' }
            }}
          >
            Reset Baseline State
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
