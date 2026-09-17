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
import BoltIcon from '@mui/icons-material/Bolt';
import { useDemoData } from '../context/DemoDataContext';

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isJudgeDemoActive, loadJudgeDemo, exitJudgeDemo, resetToBaseline } = useDemoData();

  const [failOn, setFailOn] = useState('high');
  const [scanFreq, setScanFreq] = useState('5');
  const [vscodeNotify, setVscodeNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const border  = isDark ? '#1f2937' : '#e2e8f0';
  const surface = isDark ? '#111827' : '#ffffff';

  return (
    <Box sx={{ maxWidth: 740, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em', mb: 0.5 }}>
          Settings &amp; Security Policy
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure verification triggers, CI fail gates, and evaluation demo tools.
        </Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', fontWeight: 600 }}>Settings saved successfully.</Alert>}

      {/* Scan policy */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2.5, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px -2px rgba(15,23,42,0.04)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: 'text.primary', mb: 2 }}>Scan &amp; CI Gate Policy</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.75, letterSpacing: '0.03em' }}>
              CI FAIL THRESHOLD
            </Typography>
            <Select fullWidth size="small" value={failOn} onChange={(e) => setFailOn(e.target.value)} sx={{ borderRadius: '8px' }}>
              <MenuItem value="high">High risk only (recommended)</MenuItem>
              <MenuItem value="medium">Medium &amp; high risk</MenuItem>
              <MenuItem value="low">Any detected change</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.75, letterSpacing: '0.03em' }}>
              BACKGROUND SCAN INTERVAL
            </Typography>
            <Select fullWidth size="small" value={scanFreq} onChange={(e) => setScanFreq(e.target.value)} sx={{ borderRadius: '8px' }}>
              <MenuItem value="1">Every 1 minute</MenuItem>
              <MenuItem value="5">Every 5 minutes</MenuItem>
              <MenuItem value="15">Every 15 minutes</MenuItem>
              <MenuItem value="manual">Manual only</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2.5, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px -2px rgba(15,23,42,0.04)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: 'text.primary', mb: 1.5 }}>Editor Notifications</Typography>
        <FormControlLabel
          control={<Switch checked={vscodeNotify} onChange={(e) => setVscodeNotify(e.target.checked)} color="primary" />}
          label={<Typography variant="body2" sx={{ fontWeight: 550, color: 'text.primary' }}>Show real-time VS Code / Cursor status bar alerts upon trust drift</Typography>}
        />
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3.5, py: 1 }}>
          Save Preferences
        </Button>
      </Box>

      <Divider sx={{ borderColor: border, mb: 4 }} />

      {/* Judge Demo */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: surface, borderColor: 'rgba(245,158,11,0.35)', boxShadow: isDark ? 'none' : '0 2px 12px rgba(245,158,11,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BoltIcon sx={{ color: '#d97706', fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>Evaluation &amp; Threat Simulation</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5, lineHeight: 1.6 }}>
          Simulates an unauthorized capability expansion (network egress + debug privileges) on a production tool manifest in 1 click.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />} onClick={loadJudgeDemo}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 2px 8px rgba(245,158,11,0.25)', color: '#fff', px: 2, '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' } }}>
            {isJudgeDemoActive ? 'Restart Demo' : 'Launch Simulation Demo'}
          </Button>
          {isJudgeDemoActive && (
            <Button variant="outlined" size="small" onClick={exitJudgeDemo}
              sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '8px', borderColor: border, color: 'text.secondary' }}>
              Exit Demo
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={resetToBaseline}
            sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '8px', borderColor: border, color: 'text.secondary' }}>
            Reset Baseline
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
