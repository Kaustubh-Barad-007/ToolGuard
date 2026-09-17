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
  useTheme,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
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
    isVerifying,
    loadIdeWorkspace,
    loadJudgeDemo,
    simulateDrift,
    resetToBaseline,
    deleteTool,
    disconnectProject,
  } = useDemoData();

  const getEcosystemBadge = (name: string) => {
    if (name.startsWith('mcp:')) return { label: 'MCP', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (name.startsWith('npm:')) return { label: 'NPM', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    if (name.startsWith('agent:')) return { label: 'AGENT', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    if (name.startsWith('vscode:')) return { label: 'VS CODE', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    return { label: 'TOOL', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
  };

  const [scanning, setScanning] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<string>('all');
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
          message: `Drift detected: ${result.driftCount} capability manifest(s) deviate from the baseline.`
        });
      } else {
        setScanFeedback({
          severity: 'success',
          message: `Integrity verified: all ${result.totalTools} tool capabilities match baseline signatures.`
        });
      }
    }
  };

  const handleSimulate = async () => {
    await simulateDrift();
    setScanFeedback({
      severity: 'error',
      message: 'Simulated capability drift injected on npm:dev (elevated execution boundary).'
    });
  };

  const handleReset = async () => {
    await resetToBaseline();
    setScanFeedback({
      severity: 'success',
      message: 'Baseline restored. All capability definitions verified.'
    });
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Color tokens
  const border       = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const surface      = isDark ? '#0d1117' : '#ffffff';
  const surfaceMuted = isDark ? '#080c10' : '#f6f8fa';
  const accent       = isDark ? '#00d4aa' : '#008b72';
  const danger       = isDark ? '#f85149' : '#cf222e';
  const warning      = isDark ? '#d29922' : '#9a6700';
  const textMuted    = isDark ? '#8b949e' : '#57606a';

  // Filter tools
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

  // Empty state
  if (!activeWorkspace || scanStatuses.length === 0) {
    const installScript = `npm install -g https://toolguard-app.vercel.app/toolguard.tgz\ntoolguard init -y\ntoolguard scan`;

    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', pt: 8, pb: 6 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: '12px',
            backgroundColor: surface,
            borderColor: border,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldOutlinedIcon sx={{ color: accent, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
                No Active Project Connected
              </Typography>
              <Typography variant="body2" sx={{ color: textMuted }}>
                Initialize ToolGuard in your repository to monitor agent tool capabilities.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ my: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: textMuted, letterSpacing: '0.04em' }}>
                TERMINAL SETUP
              </Typography>
              <Tooltip title={copiedCmd ? 'Copied' : 'Copy command'}>
                <IconButton size="small" onClick={() => handleCopyCmd(installScript)} sx={{ color: textMuted }}>
                  {copiedCmd ? <CheckIcon sx={{ fontSize: 16, color: accent }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: '8px',
                backgroundColor: surfaceMuted,
                border: `1px solid ${border}`,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.82rem',
                color: isDark ? '#e6edf3' : '#24292f',
                lineHeight: 1.7,
                overflowX: 'auto',
              }}
            >
              {installScript}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              disabled={isVerifying}
              startIcon={isVerifying ? <CircularProgress size={13} color="inherit" /> : <CodeIcon sx={{ fontSize: 16 }} />}
              onClick={() => loadIdeWorkspace()}
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: '6px',
                px: 2,
                py: 0.8,
                backgroundColor: isDark ? '#10b981' : '#059669',
                color: '#ffffff',
                '&:hover': { backgroundColor: isDark ? '#059669' : '#047857' }
              }}
            >
              {isVerifying ? 'Connecting IDE Suite…' : '⚡ Load Active IDE Project (VS Code + MCP + NPM)'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/integrations')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px',
                px: 2,
                py: 0.8,
                borderColor: border,
                color: 'text.primary',
              }}
            >
              Setup Guides
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px',
                px: 2,
                py: 0.8,
                borderColor: border,
                color: textMuted,
              }}
            >
              Load Example Project
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Metric cards
  const stats = [
    {
      label: 'Capabilities',
      value: scanStatuses.length,
      sub: `${tools.filter(t => t.permissions?.includes('admin')).length} privileged`,
      icon: <LayersOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />,
    },
    {
      label: 'Baseline Fingerprint',
      value: `v${baseline?.version || 1}`,
      sub: 'SHA-256 frozen',
      icon: <FingerprintOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />,
    },
    {
      label: 'Drift Incidents',
      value: openDrift.length,
      sub: openDrift.length === 0 ? 'Zero drift detected' : 'Action required',
      danger: openDrift.length > 0,
      icon: openDrift.length > 0
        ? <WarningAmberIcon sx={{ fontSize: 18, color: danger }} />
        : <ShieldOutlinedIcon sx={{ fontSize: 18, color: accent }} />,
    },
    {
      label: 'Last Verification',
      value: lastScanTime,
      sub: 'Continuous watch',
      small: true,
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
              {activeWorkspace.name}
            </Typography>
            <Chip
              size="small"
              label={isProtected ? 'Baseline verified' : `${openDrift.length} drift detected`}
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: isProtected
                  ? (isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)')
                  : (isDark ? 'rgba(248, 81, 73, 0.1)' : 'rgba(207, 34, 46, 0.08)'),
                color: isProtected ? accent : danger,
                border: `1px solid ${isProtected ? (isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 139, 114, 0.2)') : (isDark ? 'rgba(248, 81, 73, 0.25)' : 'rgba(207, 34, 46, 0.2)')}`,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: textMuted, mt: 0.25 }}>
            Environment: <strong>{activeWorkspace.stack}</strong> · {scanStatuses.length} registered tools
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={(scanning || isVerifying) ? <CircularProgress size={13} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
            onClick={handleScan}
            disabled={scanning || isVerifying}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: '6px',
              px: 1.75,
              py: 0.6,
            }}
          >
            {(scanning || isVerifying) ? 'Verifying Baseline…' : 'Run Scan'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            disabled={isVerifying}
            startIcon={isVerifying ? <CircularProgress size={13} color="inherit" /> : <CodeIcon sx={{ fontSize: 15 }} />}
            onClick={() => loadIdeWorkspace()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: '6px',
              borderColor: border,
              color: 'text.primary',
              '&:hover': { borderColor: accent, color: accent }
            }}
          >
            Load IDE Suite
          </Button>

          {!isProtected ? (
            <>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/drift')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  borderColor: danger,
                  color: danger,
                  '&:hover': {
                    borderColor: danger,
                    backgroundColor: isDark ? 'rgba(248, 81, 73, 0.08)' : 'rgba(207, 34, 46, 0.04)',
                  }
                }}
              >
                Review Drift ({openDrift.length})
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                onClick={handleReset}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  borderColor: border,
                  color: textMuted,
                  '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
                }}
              >
                Restore
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={handleSimulate}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: '6px',
                borderColor: border,
                color: textMuted,
                '&:hover': { borderColor: warning, color: warning }
              }}
            >
              Simulate Drift
            </Button>
          )}

          <Button
            variant="text"
            size="small"
            onClick={() => setConfirmDisconnect(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.8rem',
              color: textMuted,
              '&:hover': { color: danger }
            }}
          >
            Disconnect
          </Button>
        </Box>
      </Box>

      {/* Feedback Banner */}
      {scanFeedback && (
        <Alert
          severity={scanFeedback.severity}
          onClose={() => setScanFeedback(null)}
          sx={{
            mb: 2.5,
            borderRadius: '8px',
            fontSize: '0.84rem',
            border: `1px solid ${scanFeedback.severity === 'error' ? (isDark ? 'rgba(248, 81, 73, 0.3)' : 'rgba(207, 34, 46, 0.2)') : (isDark ? 'rgba(0, 212, 170, 0.3)' : 'rgba(0, 139, 114, 0.2)')}`,
          }}
        >
          {scanFeedback.message}
        </Alert>
      )}

      {/* Metric Cards Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: border,
                transition: 'border-color 0.15s ease',
                '&:hover': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)',
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </Typography>
                {s.icon}
              </Box>
              <Typography sx={{
                fontWeight: 700,
                fontSize: s.small ? '1.05rem' : '1.5rem',
                color: s.danger ? danger : 'text.primary',
                fontFamily: '"JetBrains Mono", monospace',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.74rem', mt: 0.5, display: 'block' }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter Toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1.5
      }}>
        <TextField
          size="small"
          placeholder="Filter capabilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: textMuted }} />
              </InputAdornment>
            )
          }}
          sx={{
            width: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.82rem',
              backgroundColor: surface,
              '& fieldset': { borderColor: border },
              '&:hover fieldset': { borderColor: 'text.secondary' },
              '&.Mui-focused fieldset': { borderColor: accent }
            }
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {[
            { label: 'All', value: 'all' },
            { label: 'admin', value: 'admin' },
            { label: 'network', value: 'network' },
            { label: 'write', value: 'write' },
            { label: 'execute', value: 'execute' }
          ].map(f => {
            const isSelected = selectedPermission === f.value;
            return (
              <Chip
                key={f.value}
                label={f.label}
                size="small"
                clickable
                onClick={() => setSelectedPermission(f.value)}
                sx={{
                  height: 26,
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                    : 'transparent',
                  color: isSelected ? 'text.primary' : textMuted,
                  border: `1px solid ${isSelected ? (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)') : border}`,
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary'
                  }
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Capability Manifest Table */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: surface,
          borderColor: border,
        }}
      >
        {isVerifying && (
          <LinearProgress
            sx={{
              height: 2,
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #10b981 0%, #6366f1 50%, #10b981 100%)',
                animation: 'shimmerScan 1.2s infinite linear'
              }
            }}
          />
        )}
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: surfaceMuted }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tool Identifier
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Integrity
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Permissions
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Target / Command
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: textMuted, fontSize: '0.84rem' }}>
                  No capabilities match the query.
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => {
                const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
                const hasAdmin = toolDef?.permissions?.includes('admin');
                const hasNetwork = toolDef?.permissions?.includes('network');
                const eco = getEcosystemBadge(tool.name);

                return (
                  <TableRow
                    key={tool.toolId}
                    hover
                    sx={{
                      '& td': { borderBottom: `1px solid ${border}`, py: 1.2 },
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    {/* Tool Identifier */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={eco.label}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            backgroundColor: eco.bg,
                            color: eco.color,
                            border: `1px solid ${eco.color}33`,
                            px: 0.5,
                          }}
                        />
                        <Typography sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          fontSize: '0.82rem',
                          fontFamily: '"JetBrains Mono", monospace'
                        }}>
                          {tool.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Integrity Badge */}
                    <TableCell>
                      <StatusBadge status={tool.status} />
                    </TableCell>

                    {/* Permissions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {toolDef?.permissions?.map((perm: string) => {
                          const isAdm = perm === 'admin';
                          const isNet = perm === 'network';
                          return (
                            <Chip
                              key={perm}
                              label={perm}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 500,
                                borderRadius: '4px',
                                backgroundColor: isAdm
                                  ? (isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)')
                                  : isNet
                                  ? (isDark ? 'rgba(210, 153, 34, 0.12)' : 'rgba(154, 103, 0, 0.08)')
                                  : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'),
                                color: isAdm ? danger : isNet ? warning : textMuted,
                                border: `1px solid ${isAdm ? (isDark ? 'rgba(248, 81, 73, 0.25)' : 'rgba(207, 34, 46, 0.2)') : border}`,
                              }}
                            />
                          );
                        }) || <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                      </Box>
                    </TableCell>

                    {/* Execution Boundary */}
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.78rem',
                          color: textMuted,
                          maxWidth: 320,
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {toolDef?.execution?.command || toolDef?.endpoint || 'static declaration'}
                      </Typography>
                    </TableCell>

                    {/* Delete Action */}
                    <TableCell align="right">
                      <Tooltip title="Remove tool definition">
                        <IconButton
                          size="small"
                          onClick={() => setToolToDelete(tool)}
                          sx={{
                            color: textMuted,
                            p: 0.5,
                            borderRadius: '6px',
                            '&:hover': {
                              color: danger,
                              backgroundColor: isDark ? 'rgba(248, 81, 73, 0.1)' : 'rgba(207, 34, 46, 0.08)'
                            }
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
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

      {/* Delete Dialog */}
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
            maxWidth: 420,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', pb: 1 }}>
          Remove Tool Definition
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.84rem' }}>
            Remove <strong>{toolToDelete?.name}</strong> from project tracking? The baseline fingerprint will be recalculated.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setToolToDelete(null)}
            size="small"
            sx={{ textTransform: 'none', color: textMuted, fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (toolToDelete) {
                deleteTool(toolToDelete.toolId);
                setToolToDelete(null);
              }
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              backgroundColor: danger,
              '&:hover': { backgroundColor: isDark ? '#d83a33' : '#a40e26' }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Dialog */}
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
            maxWidth: 420,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', pb: 1 }}>
          Disconnect Project
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.84rem' }}>
            Unlink <strong>{activeWorkspace?.name}</strong> from ToolGuard? Local manifests will no longer be monitored for drift.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDisconnect(false)}
            size="small"
            sx={{ textTransform: 'none', color: textMuted, fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setConfirmDisconnect(false);
              disconnectProject();
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              backgroundColor: danger,
              '&:hover': { backgroundColor: isDark ? '#d83a33' : '#a40e26' }
            }}
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
