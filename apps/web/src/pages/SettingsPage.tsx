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
  Chip,
  useTheme
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CheckIcon from '@mui/icons-material/Check';
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

  const border        = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(210, 218, 235, 0.85)';
  const surface       = isDark ? '#0D1220' : '#ffffff';
  const surfaceMuted  = isDark ? '#080B14' : '#F7F8FC';
  const accentPrimary = isDark ? '#00D4AA' : '#008B72';
  const accentViolet  = isDark ? '#7C5CFC' : '#5B3FD4';
  const warningColor  = isDark ? '#FFB340' : '#CC8A1E';
  const textMuted     = isDark ? '#6B7A99' : '#5A6578';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
          <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.03em' }}>
            Security Policy &amp; Engine Rules
          </Typography>
          <Chip
            label="ENTERPRISE GUARD"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.67rem',
              fontWeight: 800,
              backgroundColor: `${accentPrimary}15`,
              color: accentPrimary,
              border: `1px solid ${accentPrimary}35`,
              borderRadius: '7px'
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: textMuted, fontWeight: 500 }}>
          Configure CI/CD gate fail thresholds, background verification cadence, and threat evaluation sandbox parameters.
        </Typography>
      </Box>

      {saved && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: '12px',
            fontWeight: 700,
            border: `1px solid ${accentPrimary}40`,
            backgroundColor: `${accentPrimary}12`
          }}
        >
          Security policy configurations saved successfully.
        </Alert>
      )}

      {/* ── 1. SCAN & CI GATE POLICY ─────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3.5,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: surface,
          borderColor: border,
          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: `${accentPrimary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PolicyOutlinedIcon sx={{ color: accentPrimary, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.015em' }}>
              Verification Cadence &amp; CI Gate Policy
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Automated rules for pipeline halting and local verification
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              CI/CD FAIL THRESHOLD
            </Typography>
            <Select
              fullWidth
              size="small"
              value={failOn}
              onChange={(e) => setFailOn(e.target.value)}
              sx={{
                borderRadius: '9px',
                backgroundColor: surfaceMuted,
                '& fieldset': { borderColor: border }
              }}
            >
              <MenuItem value="high">High risk only (recommended)</MenuItem>
              <MenuItem value="medium">Medium &amp; high risk alterations</MenuItem>
              <MenuItem value="low">Strict mode — any manifest change</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              BACKGROUND VERIFICATION FREQUENCY
            </Typography>
            <Select
              fullWidth
              size="small"
              value={scanFreq}
              onChange={(e) => setScanFreq(e.target.value)}
              sx={{
                borderRadius: '9px',
                backgroundColor: surfaceMuted,
                '& fieldset': { borderColor: border }
              }}
            >
              <MenuItem value="1">Continuous — every 1 minute</MenuItem>
              <MenuItem value="5">Standard — every 5 minutes</MenuItem>
              <MenuItem value="15">Relaxed — every 15 minutes</MenuItem>
              <MenuItem value="manual">Manual verification only</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* ── 2. NOTIFICATIONS & ALERTS ────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3.5,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: surface,
          borderColor: border,
          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: `${accentViolet}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <NotificationsActiveOutlinedIcon sx={{ color: accentViolet, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.015em' }}>
              IDE &amp; Desktop Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Push live alerts directly to developer status bar upon drift detection
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={vscodeNotify}
              onChange={(e) => setVscodeNotify(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: accentPrimary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentPrimary }
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Display real-time VS Code, Cursor AI, and Windsurf status bar alerts when trust drift occurs
            </Typography>
          }
        />
      </Paper>

      {/* Save Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<CheckIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 750,
            borderRadius: '9px',
            px: 3.5,
            py: 1.1,
            fontSize: '0.88rem'
          }}
        >
          Save Security Policy
        </Button>
      </Box>

      <Divider sx={{ borderColor: border, mb: 4 }} />

      {/* ── 3. EVALUATION DEMO THREAT SANDBOX ────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3.5,
          borderRadius: '16px',
          backgroundColor: surface,
          borderColor: `${warningColor}40`,
          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: `${warningColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BoltIcon sx={{ color: warningColor, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.015em' }}>
              Evaluation Demo &amp; Threat Simulation Sandbox
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Simulates real-world capability alteration in 1 click for testing
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: textMuted, mb: 3, lineHeight: 1.65, fontSize: '0.86rem' }}>
          Instantly simulates an unauthorized capability expansion (network egress + debug shell privileges) on a production tool manifest without touching real host security.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />}
            onClick={loadJudgeDemo}
            sx={{
              textTransform: 'none',
              fontWeight: 750,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FFB340 0%, #D97706 100%)',
              boxShadow: '0 3px 12px rgba(217, 119, 6, 0.35)',
              color: '#fff',
              px: 2.5,
              py: 0.85,
              '&:hover': {
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                boxShadow: '0 5px 16px rgba(217, 119, 6, 0.45)',
              }
            }}
          >
            {isJudgeDemoActive ? 'Restart Simulation' : 'Launch Simulation Threat'}
          </Button>

          {isJudgeDemoActive && (
            <Button
              variant="outlined"
              size="small"
              onClick={exitJudgeDemo}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                borderColor: border,
                color: textMuted,
                px: 2,
                py: 0.85
              }}
            >
              Exit Simulation
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={resetToBaseline}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              borderColor: border,
              color: textMuted,
              px: 2,
              py: 0.85
            }}
          >
            Reset Immutable Baseline
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
