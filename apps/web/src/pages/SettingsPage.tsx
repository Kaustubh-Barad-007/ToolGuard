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

  const border  = isDark ? '#30363d' : '#d0d7de';
  const surface = isDark ? '#161b22' : '#ffffff';

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>Settings</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Scan policy, notifications, and demo controls.</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>Settings saved.</Alert>}

      {/* Scan policy */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>Scan & CI Policy</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.75 }}>
              CI FAIL THRESHOLD
            </Typography>
            <Select fullWidth size="small" value={failOn} onChange={(e) => setFailOn(e.target.value)} sx={{ borderRadius: '6px' }}>
              <MenuItem value="high">High risk only (recommended)</MenuItem>
              <MenuItem value="medium">Medium & high risk</MenuItem>
              <MenuItem value="low">Any detected change</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.75 }}>
              BACKGROUND SCAN INTERVAL
            </Typography>
            <Select fullWidth size="small" value={scanFreq} onChange={(e) => setScanFreq(e.target.value)} sx={{ borderRadius: '6px' }}>
              <MenuItem value="1">Every 1 minute</MenuItem>
              <MenuItem value="5">Every 5 minutes</MenuItem>
              <MenuItem value="15">Every 15 minutes</MenuItem>
              <MenuItem value="manual">Manual only</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1.5 }}>Notifications</Typography>
        <FormControlLabel
          control={<Switch checked={vscodeNotify} onChange={(e) => setVscodeNotify(e.target.checked)} size="small" />}
          label={<Typography variant="body2">VS Code status bar alert on capability drift</Typography>}
        />
      </Paper>

      <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 3, mb: 3, boxShadow: 'none' }}>
        Save
      </Button>

      <Divider sx={{ borderColor: border, mb: 3 }} />

      {/* Judge Demo */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', backgroundColor: surface, borderColor: 'rgba(245,158,11,0.35)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BoltIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>Hackathon Judge Demo</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1.6 }}>
          Simulates an unauthorized capability expansion (network egress + debug privileges) on a production tool manifest in 1 click.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />} onClick={loadJudgeDemo}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', background: '#f59e0b', boxShadow: 'none', color: '#fff', '&:hover': { background: '#d97706', boxShadow: 'none' } }}>
            {isJudgeDemoActive ? 'Restart demo' : 'Launch demo'}
          </Button>
          {isJudgeDemoActive && (
            <Button variant="outlined" size="small" onClick={exitJudgeDemo}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', borderColor: border, color: 'text.secondary' }}>
              Exit demo
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={resetToBaseline}
            sx={{ textTransform: 'none', borderRadius: '6px', borderColor: border, color: 'text.secondary' }}>
            Reset baseline
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
