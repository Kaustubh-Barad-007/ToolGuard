import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const {
    tools,
    scanStatuses,
    driftEvents,
    lastScanTime,
    triggerScan,
    baseline,
    activeWorkspace,
    loadJudgeDemo,
  } = useDemoData();

  const [scanning, setScanning] = useState(false);
  const openDrift = driftEvents.filter(e => e.status === 'open');
  const isProtected = openDrift.length === 0;

  const handleScan = async () => {
    setScanning(true);
    await triggerScan();
    setScanning(false);
  };

  const border = isDark ? '#30363d' : '#d0d7de';
  const surface = isDark ? '#161b22' : '#ffffff';
  const surfaceMuted = isDark ? '#0d1117' : '#f6f8fa';

  // ── Empty / Not connected state ──────────────────────────────────────────────
  if (!activeWorkspace || scanStatuses.length === 0) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', pt: 8, textAlign: 'center' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
          <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary', letterSpacing: '-0.01em' }}>
          No project connected
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.7 }}>
          Install ToolGuard CLI in your project, then import the baseline here to start monitoring tool capabilities.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
          <Button variant="contained" startIcon={<HubOutlinedIcon />} onClick={() => navigate('/integrations')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}>
            Connect Project
          </Button>
          <Button variant="outlined" startIcon={<BoltIcon />}
            onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5, borderColor: '#f59e0b', color: '#f59e0b', '&:hover': { borderColor: '#d97706', backgroundColor: 'rgba(245,158,11,0.06)' } }}>
            Try Demo
          </Button>
        </Box>
        <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'left', borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.25 }}>
            Quick start
          </Typography>
          <Box component="pre" sx={{ m: 0, p: 1.5, borderRadius: '6px', backgroundColor: surfaceMuted, border: `1px solid ${border}`, fontFamily: 'monospace', fontSize: '0.8rem', color: isDark ? '#58a6ff' : '#0550ae', overflowX: 'auto', lineHeight: 1.7 }}>
{`npm install -g https://toolguard-app.vercel.app/toolguard.tgz
toolguard init -y
toolguard scan`}
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Connected state ─────────────────────────────────────────────────────────
  const stats = [
    { label: 'Tools monitored', value: scanStatuses.length, sub: 'in workspace' },
    { label: 'Baseline version', value: `v${baseline?.version || 1}`, sub: 'SHA-256 verified' },
    { label: 'Trust drift', value: openDrift.length, sub: openDrift.length === 0 ? 'All clear' : 'Action required', danger: openDrift.length > 0 },
    { label: 'Last verified', value: lastScanTime, sub: 'Continuous monitoring', small: true },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
              {activeWorkspace.name}
            </Typography>
            <Chip
              label={isProtected ? 'Protected' : 'Drift detected'}
              size="small"
              sx={{
                height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: '10px',
                backgroundColor: isProtected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: isProtected ? '#10b981' : '#ef4444',
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {activeWorkspace.stack} · {scanStatuses.length} tools monitored
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isProtected ? (
            <Button variant="contained" color="error" size="small" onClick={() => navigate('/drift')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', fontSize: '0.82rem' }}>
              Review {openDrift.length} drift{openDrift.length > 1 ? 's' : ''}
            </Button>
          ) : (
            <Button variant="outlined" size="small" startIcon={<PlayArrowIcon sx={{ fontSize: '15px !important' }} />} onClick={handleScan} disabled={scanning}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', fontSize: '0.82rem', borderColor: border, color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
              {scanning ? 'Scanning…' : 'Scan now'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Drift alert */}
      {!isProtected && (
        <Alert severity="error" variant="outlined"
          action={<Button color="error" size="small" onClick={() => navigate('/drift')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>View diff →</Button>}
          sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.84rem' }}>
          <strong>Trust drift detected:</strong> {openDrift.length} tool modification{openDrift.length > 1 ? 's' : ''} violating the trusted baseline.
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                {s.label.toUpperCase()}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: s.small ? '1rem' : '1.5rem', mt: 0.5, color: s.danger ? '#ef4444' : 'text.primary', lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tools table */}
      <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: surface, borderColor: border }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}` }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Tool Capability Manifest</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>SHA-256 fingerprinted capabilities</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: surfaceMuted }}>
              {['Tool', 'Status', 'Permissions', 'Command'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', py: 1, borderBottom: `1px solid ${border}` }}>
                  {h.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {scanStatuses.map((tool) => {
              const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
              return (
                <TableRow key={tool.toolId} hover sx={{ '& td': { borderBottom: `1px solid ${border}`, py: 1.25 } }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.84rem' }}>{tool.name}</TableCell>
                  <TableCell><StatusBadge status={tool.status} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {toolDef?.permissions?.map((perm: string) => (
                        <Chip key={perm} label={perm} size="small" sx={{
                          height: 18, fontSize: '0.68rem', fontWeight: 600, borderRadius: '4px',
                          backgroundColor: perm === 'admin' ? 'rgba(239,68,68,0.12)' : perm === 'network' ? 'rgba(245,158,11,0.12)' : perm === 'write' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)',
                          color: perm === 'admin' ? '#ef4444' : perm === 'network' ? '#f59e0b' : perm === 'write' ? '#3b82f6' : '#10b981',
                        }} />
                      )) || <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
                    {toolDef?.execution?.command || toolDef?.endpoint || '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
