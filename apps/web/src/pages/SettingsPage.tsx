import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useDemoData } from '../context/DemoDataContext';

export const SettingsPage: React.FC = () => {
  const {
    activeWorkspace,
    isJudgeDemoActive,
    loadJudgeDemo,
    exitJudgeDemo,
    resetToBaseline
  } = useDemoData();

  const [scanFrequency, setScanFrequency] = useState('5');
  const [failOn, setFailOn] = useState('high');
  const [vscodeNotify, setVscodeNotify] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', mb: 0.5 }}>
          Settings & Policies
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Configure scanning thresholds, automated CI gates, and notification alerts.
        </Typography>
      </Box>

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings updated successfully.
        </Alert>
      )}

      {/* Project Configuration */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Active Project Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Project Name"
              value={activeWorkspace ? activeWorkspace.name : 'No Project Active'}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Stack Type"
              value={activeWorkspace ? activeWorkspace.stack : 'None'}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Scanning Policy */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Scanning & CI Enforcement Policy
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 650 }}>
              CI FAILURE POLICY (--fail-on)
            </Typography>
            <Select
              fullWidth
              size="small"
              value={failOn}
              onChange={(e) => setFailOn(e.target.value)}
            >
              <MenuItem value="high">Fail only on HIGH RISK changes (Recommended)</MenuItem>
              <MenuItem value="medium">Fail on MEDIUM & HIGH risk</MenuItem>
              <MenuItem value="low">Fail on any detected change</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 650 }}>
              BACKGROUND SCAN INTERVAL
            </Typography>
            <Select
              fullWidth
              size="small"
              value={scanFrequency}
              onChange={(e) => setScanFrequency(e.target.value)}
            >
              <MenuItem value="1">Every 1 minute</MenuItem>
              <MenuItem value="5">Every 5 minutes</MenuItem>
              <MenuItem value="15">Every 15 minutes</MenuItem>
              <MenuItem value="manual">Manual trigger only</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Notifications & Alerts
        </Typography>
        <FormControlLabel
          control={<Switch checked={vscodeNotify} onChange={(e) => setVscodeNotify(e.target.checked)} />}
          label="Display VS Code toast notification when capability drift is detected"
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Alerts developers non-intrusively in the editor status bar with a 1-click review action.
        </Typography>
      </Paper>

      {/* Hackathon Judge Demo Tour */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: '1px solid rgba(245, 158, 11, 0.35)',
          backgroundColor: 'rgba(245, 158, 11, 0.04)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <BoltIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
            Hackathon Judge Demo Tour
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
          Experience a realistic capability expansion scenario in 1 click. Simulates unauthorized network egress and debug privileges on a production tool manifest.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<BoltIcon />}
            onClick={loadJudgeDemo}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              fontWeight: 750,
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
            }}
          >
            {isJudgeDemoActive ? 'Restart Judge Demo' : 'Launch Judge Demo'}
          </Button>

          {isJudgeDemoActive && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={exitJudgeDemo}
              sx={{ textTransform: 'none', fontWeight: 650 }}
            >
              Exit Judge Demo
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={resetToBaseline}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Reset Safe Baseline
          </Button>
        </Box>
      </Paper>

      <Button variant="contained" color="primary" onClick={handleSave} sx={{ px: 4, py: 1, fontWeight: 700 }}>
        Save Preferences
      </Button>
    </Box>
  );
};
