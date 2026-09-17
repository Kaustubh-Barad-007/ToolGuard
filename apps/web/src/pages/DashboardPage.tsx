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
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { ToolScanStatus } from '@toolguard/shared';
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
    simulateDrift,
    resetToBaseline,
    deleteTool,
    disconnectProject,
  } = useDemoData();

  const [scanning, setScanning] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<string>('all');
  const [showGuide, setShowGuide] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<ToolScanStatus | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ severity: 'error' | 'success'; message: string } | null>(null);

  const openDrift = driftEvents.filter(e => e.status === 'open');
  const isProtected = openDrift.length === 0;

  const handleScan = async () => {
    setScanning(true);
    const result = await triggerScan();
    setScanning(false);
    if (result) {
      if (result.driftCount > 0) {
        setScanFeedback({
          severity: 'error',
          message: `🚨 Drift Detected! ${result.driftCount} tool(s) have unauthorized capability drift and do not match the trusted baseline.`
        });
      } else {
        setScanFeedback({
          severity: 'success',
          message: `✓ Verification Scan Passed: All ${result.totalTools} tool(s) match the trusted SHA-256 cryptographic baseline (SAFE).`
        });
      }
    }
  };

  const handleSimulate = async () => {
    await simulateDrift();
    setScanFeedback({
      severity: 'error',
      message: '🚨 Simulated Threat Injected: Unauthorized capability expansion detected. Status updated to TRUST DRIFT.'
    });
  };

  const handleReset = async () => {
    await resetToBaseline();
    setScanFeedback({
      severity: 'success',
      message: '✓ Cryptographic baseline restored. All tools are verified and safe.'
    });
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const border = isDark ? '#1e2638' : '#e2e8f0';
  const surface = isDark ? '#0f141f' : '#ffffff';
  const surfaceMuted = isDark ? '#080b11' : '#f8fafc';

  // ── Filter tools by search & permission boundary ──
  const filteredTools = scanStatuses.filter(tool => {
    const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (toolDef?.execution?.command && toolDef.execution.command.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (selectedPermission === 'all') return true;

    const perms = toolDef?.permissions || [];
    return perms.includes(selectedPermission);
  });

  // ── Empty / Not connected state ──────────────────────────────────────────────
  if (!activeWorkspace || scanStatuses.length === 0) {
    const installScript = `npm install -g https://toolguard-app.vercel.app/toolguard.tgz\ntoolguard init -y\ntoolguard scan`;

    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', pt: 6, pb: 4, textAlign: 'center' }}>
        <Box sx={{ width: 68, height: 68, borderRadius: '20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
          <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 36 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', letterSpacing: '-0.025em' }}>
          Connect a Project to ToolGuard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.6, maxWidth: 500, mx: 'auto' }}>
          Zero-trust capability verification for developer tools &amp; AI agents. Freeze tool definitions into deterministic SHA-256 baselines and detect trust drift before runtime.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
          <Button variant="contained" startIcon={<HubOutlinedIcon />} onClick={() => navigate('/integrations')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, py: 1 }}>
            Connect Project (IDE / CLI)
          </Button>
          <Button variant="outlined" startIcon={<BoltIcon sx={{ color: '#d97706' }} />}
            onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, borderColor: '#f59e0b', color: '#d97706', '&:hover': { borderColor: '#d97706', backgroundColor: 'rgba(245,158,11,0.06)' } }}>
            ⚡ 1-Click Evaluation Demo
          </Button>
        </Box>

        <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'left', borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 2px 8px rgba(15,23,42,0.04)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 750, color: 'text.secondary', letterSpacing: '0.04em' }}>
              UNIVERSAL CLI INSTALL &amp; INITIALIZE
            </Typography>
            <Tooltip title={copiedCmd ? 'Copied!' : 'Copy Commands'}>
              <IconButton size="small" onClick={() => handleCopyCmd(installScript)} sx={{ color: 'text.secondary' }}>
                {copiedCmd ? <CheckIcon sx={{ fontSize: 16, color: '#059669' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box component="pre" sx={{ m: 0, p: 1.8, borderRadius: '8px', backgroundColor: isDark ? '#0b0f19' : '#0f172a', border: `1px solid ${border}`, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto', lineHeight: 1.7 }}>
            {installScript}
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Connected state metrics ──
  const stats = [
    {
      label: 'Monitored Tools',
      value: scanStatuses.length,
      sub: 'Active in workspace',
      accent: '#4f46e5',
      icon: <FolderOpenOutlinedIcon sx={{ fontSize: 19, color: '#4f46e5' }} />,
      iconBg: 'rgba(99, 102, 241, 0.1)'
    },
    {
      label: 'Baseline Version',
      value: `v${baseline?.version || 1}`,
      sub: 'SHA-256 verified',
      accent: '#059669',
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 19, color: '#059669' }} />,
      iconBg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Trust Drift',
      value: openDrift.length,
      sub: openDrift.length === 0 ? 'All capabilities match' : 'Action required',
      danger: openDrift.length > 0,
      accent: openDrift.length > 0 ? '#e11d48' : '#059669',
      icon: openDrift.length > 0
        ? <WarningAmberIcon sx={{ fontSize: 19, color: '#e11d48' }} />
        : <CheckCircleOutlineIcon sx={{ fontSize: 19, color: '#059669' }} />,
      iconBg: openDrift.length > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Last Verification',
      value: lastScanTime,
      sub: 'Continuous monitoring',
      small: true,
      accent: '#8b5cf6',
      icon: <HistoryOutlinedIcon sx={{ fontSize: 19, color: '#8b5cf6' }} />,
      iconBg: 'rgba(139, 92, 246, 0.1)'
    },
  ];

  return (
    <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em' }}>
              {activeWorkspace.name}
            </Typography>
            <Chip
              icon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isProtected ? '#10b981' : '#f43f5e', animation: 'statusPulse 2s infinite', mr: 0.5 }} />}
              label={isProtected ? 'CRYPTOGRAPHICALLY PROTECTED' : 'UNAUTHORIZED DRIFT DETECTED'}
              size="small"
              sx={{
                height: 23, fontSize: '0.68rem', fontWeight: 750, borderRadius: '6px',
                backgroundColor: isProtected ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                color: isProtected ? '#047857' : '#be123c',
                border: `1px solid ${isProtected ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {activeWorkspace.stack} · <strong>{scanStatuses.length} tools</strong> verified against SHA-256 cryptographic baseline
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" startIcon={<HelpOutlineIcon sx={{ fontSize: '15px !important' }} />} onClick={() => setShowGuide(!showGuide)}
            sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '8px', fontSize: '0.82rem', borderColor: border, color: 'text.secondary', '&:hover': { borderColor: '#cbd5e1', color: 'text.primary' } }}>
            {showGuide ? 'Hide Guide' : 'How It Works'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlayArrowIcon sx={{ fontSize: '15px !important', color: '#059669' }} />}
            onClick={handleScan}
            disabled={scanning}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              borderRadius: '8px',
              fontSize: '0.82rem',
              borderColor: border,
              color: 'text.primary',
              '&:hover': { borderColor: '#059669' }
            }}
          >
            {scanning ? 'Verifying…' : 'Run Verification Scan'}
          </Button>

          {!isProtected ? (
            <>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => navigate('/drift')}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: '0.82rem', px: 2 }}
              >
                Review {openDrift.length} Drift Alert{openDrift.length > 1 ? 's' : ''}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
                sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '8px', fontSize: '0.82rem', borderColor: border, color: 'text.secondary' }}
              >
                Restore Baseline
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<BoltIcon sx={{ fontSize: '15px !important', color: '#d97706' }} />}
              onClick={handleSimulate}
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: '8px',
                fontSize: '0.82rem',
                borderColor: 'rgba(245,158,11,0.4)',
                color: '#b45309',
                backgroundColor: 'rgba(245,158,11,0.04)',
                '&:hover': { borderColor: '#d97706', backgroundColor: 'rgba(245,158,11,0.08)' }
              }}
            >
              Simulate Threat
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setConfirmDisconnect(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              borderRadius: '8px',
              fontSize: '0.82rem',
              borderColor: 'rgba(244,63,94,0.3)',
              color: '#e11d48',
              backgroundColor: 'rgba(244,63,94,0.03)',
              '&:hover': {
                borderColor: '#e11d48',
                backgroundColor: 'rgba(244,63,94,0.08)'
              }
            }}
          >
            Disconnect Project
          </Button>
        </Box>
      </Box>

      {/* Verification Scan Feedback Banner */}
      {scanFeedback && (
        <Alert
          severity={scanFeedback.severity}
          onClose={() => setScanFeedback(null)}
          sx={{ mb: 2.5, borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {scanFeedback.message}
        </Alert>
      )}

      {/* Interactive Architecture & Educational Guide Card */}
      {showGuide && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3.5, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 2px 10px rgba(15,23,42,0.04)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldOutlinedIcon sx={{ color: '#059669', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '-0.01em' }}>
                How ToolGuard Protects Your Project (3 Pillars)
              </Typography>
            </Box>
            <Chip label="Autonomous Continuous Protection" size="small" sx={{ fontSize: '0.68rem', fontWeight: 750, backgroundColor: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.3)' }} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)', height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#4f46e5', display: 'block', mb: 0.75, letterSpacing: '0.04em' }}>
                  1. CRYPTOGRAPHIC BASELINE
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  Freezes all discovered tool definitions, npm commands, and MCP parameters into deterministic SHA-256 hashes via <code>toolguard init</code>.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', display: 'block', mb: 0.75, letterSpacing: '0.04em' }}>
                  2. MULTI-SURFACE MONITORING
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  Continuous active monitoring via <strong>VS Code status bar</strong>, <strong>Git pre-commit gate</strong>, and real-time terminal watch (<code>toolguard scan -w</code>).
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(244,63,94,0.06)' : 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.2)', height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#e11d48', display: 'block', mb: 0.75, letterSpacing: '0.04em' }}>
                  3. ZERO-TRUST DEFENSE
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  If a tool secretly expands to <code>admin</code> or an external network endpoint, ToolGuard alerts in &lt;100ms and blocks runtime execution.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.76rem' }}>
              ⚡ <strong>Test it now:</strong> Click <em>"Simulate Threat"</em> or run <code>toolguard threat-test</code> in your terminal.
            </Typography>
            <Button size="small" onClick={() => setShowGuide(false)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary' }}>
              Dismiss Guide
            </Button>
          </Box>
        </Paper>
      )}

      {/* Drift Alert Banner */}
      {!isProtected && (
        <Alert severity="error" variant="outlined"
          action={<Button color="error" size="small" onClick={() => navigate('/drift')} sx={{ textTransform: 'none', fontWeight: 750, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Inspect Diff &amp; Resolve →</Button>}
          sx={{ mb: 3, borderRadius: '10px', fontSize: '0.85rem', borderColor: 'rgba(244,63,94,0.4)', backgroundColor: isDark ? 'rgba(244,63,94,0.06)' : 'rgba(244,63,94,0.04)' }}>
          <strong>Trust Drift Alert:</strong> Detected {openDrift.length} unauthorized capability alteration(s) violating the baseline fingerprint.
        </Alert>
      )}

      {/* Metric Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: '12px',
                backgroundColor: surface,
                borderColor: border,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px -2px rgba(15,23,42,0.04)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark ? 'none' : '0 8px 24px -4px rgba(15, 23, 42, 0.08)'
                }
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: s.accent }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750, fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  {s.label.toUpperCase()}
                </Typography>
                <Box sx={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: s.small ? '1.05rem' : '1.65rem', color: s.danger ? '#e11d48' : 'text.primary', lineHeight: 1.2, letterSpacing: '-0.025em' }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 500, mt: 0.5, display: 'block' }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Capability Search & Filter Toolbar */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: '10px', backgroundColor: surface, borderColor: border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.02)' }}>
        <TextField
          size="small"
          placeholder="Filter tools by name or command..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.82rem',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              '& fieldset': { borderColor: border }
            }
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mr: 0.5, fontSize: '0.72rem', letterSpacing: '0.03em' }}>
            PERMISSION:
          </Typography>
          {[
            { label: 'All', value: 'all' },
            { label: 'admin', value: 'admin' },
            { label: 'network', value: 'network' },
            { label: 'write', value: 'write' },
            { label: 'execute', value: 'execute' }
          ].map(filterItem => (
            <Chip
              key={filterItem.value}
              label={filterItem.label}
              size="small"
              clickable
              onClick={() => setSelectedPermission(filterItem.value)}
              sx={{
                height: 23,
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '6px',
                backgroundColor: selectedPermission === filterItem.value ? (isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)') : 'transparent',
                color: selectedPermission === filterItem.value ? '#047857' : 'text.secondary',
                border: selectedPermission === filterItem.value ? '1px solid rgba(16,185,129,0.4)' : `1px solid ${border}`,
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Tools Capability Manifest Table */}
      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 6px 18px -3px rgba(15,23,42,0.05)' }}>
        <Box sx={{ px: 2.5, py: 1.8, borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? surface : '#ffffff' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
              Tool Capability Manifest ({filteredTools.length} tools)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cryptographic SHA-256 fingerprint &amp; runtime permission boundaries</Typography>
          </Box>
          <Chip label="SHA-256 ZERO-TRUST" size="small" sx={{ height: 21, fontSize: '0.65rem', fontWeight: 750, backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.09)', color: '#047857', border: '1px solid rgba(16,185,129,0.25)' }} />
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: surfaceMuted }}>
              {['Tool Identity', 'Integrity Status', 'Granted Permissions', 'Execution Boundary', 'Action'].map((h, idx) => (
                <TableCell key={h} align={idx === 4 ? 'right' : 'left'} sx={{ fontWeight: 750, fontSize: '0.7rem', color: 'text.secondary', py: 1.3, borderBottom: `1px solid ${border}` }}>
                  {h.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No tools match the selected query.
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => {
                const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
                return (
                  <TableRow key={tool.toolId} hover sx={{ '& td': { borderBottom: `1px solid ${border}`, py: 1.4 }, transition: 'background-color 0.15s ease' }}>
                    <TableCell sx={{ fontWeight: 750, color: 'text.primary', fontSize: '0.84rem', fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
                      {tool.name}
                    </TableCell>
                    <TableCell><StatusBadge status={tool.status} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                        {toolDef?.permissions?.map((perm: string) => (
                          <Chip key={perm} label={perm} size="small" sx={{
                            height: 20, fontSize: '0.67rem', fontWeight: 700, borderRadius: '5px',
                            backgroundColor: perm === 'admin' ? 'rgba(244,63,94,0.1)' : perm === 'network' ? 'rgba(245,158,11,0.1)' : perm === 'write' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                            color: perm === 'admin' ? '#be123c' : perm === 'network' ? '#b45309' : perm === 'write' ? '#4f46e5' : '#047857',
                            border: `1px solid ${perm === 'admin' ? 'rgba(244,63,94,0.25)' : perm === 'network' ? 'rgba(245,158,11,0.25)' : perm === 'write' ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.25)'}`
                          }} />
                        )) || <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
                      <Box component="span" sx={{ px: 1, py: 0.4, borderRadius: '5px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, display: 'inline-block' }}>
                        {toolDef?.execution?.command || toolDef?.endpoint || 'static'}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.75 }}>
                      <Tooltip title={`Completely delete ${tool.name} from project`}>
                        <IconButton
                          size="small"
                          onClick={() => setToolToDelete(tool)}
                          sx={{
                            color: 'text.secondary',
                            p: 0.75,
                            '&:hover': {
                              color: '#e11d48',
                              backgroundColor: 'rgba(244,63,94,0.08)'
                            }
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Delete Tool Confirmation Dialog */}
      <Dialog
        open={Boolean(toolToDelete)}
        onClose={() => setToolToDelete(null)}
        PaperProps={{
          sx: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '12px',
            maxWidth: 440,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', pb: 1, letterSpacing: '-0.02em' }}>
          Completely Delete Tool?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.86rem', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete <strong>{toolToDelete?.name}</strong> from this project?
            This will remove the tool definition and recalculate your SHA-256 cryptographic baseline.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setToolToDelete(null)}
            size="small"
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 650 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              if (toolToDelete) {
                deleteTool(toolToDelete.toolId);
                setToolToDelete(null);
              }
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2 }}
          >
            Delete Tool
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Disconnecting / Deleting Project */}
      <Dialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        PaperProps={{
          sx: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '12px',
            maxWidth: 440,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', pb: 1, letterSpacing: '-0.02em' }}>
          Completely Disconnect Project?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.86rem', lineHeight: 1.6 }}>
            Are you sure you want to completely disconnect <strong>{activeWorkspace?.name}</strong> from ToolGuard?
            This will remove the project from ToolGuard and reset it to an unmonitored zero state.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDisconnect(false)}
            size="small"
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 650 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setConfirmDisconnect(false);
              disconnectProject();
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2 }}
          >
            Disconnect &amp; Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
