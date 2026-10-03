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
  LinearProgress,
  Collapse,
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
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { ToolScanStatus } from '@toolguard/shared';
import { BaselineManager } from '@toolguard/core';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { DiffViewer } from '../components/DiffViewer';

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
    workspaces,
    versionHistory,
    currentVersionTag,
    isLocalConnected,
    isVerifying,
    isJudgeDemoActive,
    loadIdeWorkspace,
    resetToBaseline,
    acceptDriftEvent,
    deleteTool,
    disconnectProject,
  } = useDemoData();

  const [scanning, setScanning] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toolToDelete, setToolToDelete] = useState<ToolScanStatus | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ severity: 'error' | 'success'; message: string } | null>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [isAcceptingOverviewDrift, setIsAcceptingOverviewDrift] = useState(false);

  // Color tokens
  const border    = isDark ? '#2E2E2E' : '#E5E7EB';
  const surface   = isDark ? '#1C1C1C' : '#FFFFFF';
  const surfaceBg = isDark ? '#171717' : '#F9FAFB';
  const accent    = isDark ? '#3ECF8E' : '#00C475';
  const danger    = isDark ? '#FA5252' : '#DC2626';
  const warning   = isDark ? '#F5A623' : '#D97706';
  const textMuted = isDark ? '#9E9E9E' : '#6B7280';

  const currentWorkspace = activeWorkspace
    || (workspaces?.length > 0 ? workspaces[0] : null)
    || (tools.length > 0 ? {
      id: baseline?.projectId || 'local-workspace',
      name: baseline?.projectId || 'Local Workspace',
      description: `Workspace (${tools.length} capabilities)`,
      stack: 'Custom' as const,
      tools,
      baseline,
    } : null);

  const compareStatuses = (tools.length > 0 && baseline && baseline.baselineId !== 'bl-empty')
    ? BaselineManager.compare(tools, baseline).tools
    : [];

  const statusMap = new Map<string, ToolScanStatus>();
  for (const s of scanStatuses) {
    statusMap.set(s.toolId || s.name, s);
  }
  for (const s of compareStatuses) {
    if (!statusMap.has(s.toolId || s.name) || s.driftDetected) {
      statusMap.set(s.toolId || s.name, s);
    }
  }
  const activeStatuses = Array.from(statusMap.values());

  const detectedFromStatuses = activeStatuses.filter(t => t.driftDetected);
  const openDriftEvents = driftEvents.filter(e => e.status === 'open');

  const openDriftMap = new Map<string, any>();
  for (const d of detectedFromStatuses) {
    openDriftMap.set(d.toolId || d.name, {
      eventId: `drift-${d.toolId}`,
      projectId: currentWorkspace?.id || 'workspace',
      toolId: d.toolId,
      toolName: d.name,
      baselineId: baseline?.baselineId || 'bl',
      scanId: 'scan-live',
      detectedAt: d.lastChecked || new Date().toISOString(),
      status: 'open' as const,
      severity: d.status === 'HIGH RISK' ? 'high' as const : 'medium' as const,
      changes: d.changes,
    });
  }
  for (const e of openDriftEvents) {
    const key = e.toolId || e.toolName;
    if (!openDriftMap.has(key)) {
      openDriftMap.set(key, e);
    }
  }

  const openDrift = Array.from(openDriftMap.values());
  const isProtected = openDrift.length === 0;

  const handleScan = async () => {
    setScanning(true);
    const result = await triggerScan();
    setScanning(false);
    if (result) {
      setScanFeedback(result.driftCount > 0
        ? { severity: 'error', message: `⚠ Drift detected: ${result.driftCount} tool(s) deviate from the trusted baseline.` }
        : { severity: 'success', message: `✓ All ${result.totalTools} tools match the trusted baseline.` }
      );
    }
  };

  const handleReset = async () => {
    await resetToBaseline();
    setScanFeedback({ severity: 'success', message: '✓ Baseline restored. All tools verified.' });
  };

  const handleAcceptAllDrift = async () => {
    if (openDrift.length === 0) return;
    setIsAcceptingOverviewDrift(true);
    try {
      for (const d of openDrift) {
        await acceptDriftEvent(d.eventId, d.toolId || d.toolName);
      }
      setScanFeedback({
        severity: 'success',
        message: `✓ Changes accepted! Upgraded baseline to v1.0.${baseline?.version || 1} (All tools verified SAFE).`
      });
    } catch {
      setScanFeedback({
        severity: 'error',
        message: 'Failed to accept capability changes.'
      });
    } finally {
      setIsAcceptingOverviewDrift(false);
    }
  };

  const formatDateTime = (isoString?: string): string => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const filteredTools = activeStatuses.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── EMPTY / UNCONNECTED STATE ───────────────────────────────────────────────
  if (!currentWorkspace && !isJudgeDemoActive && tools.length === 0) {
    const installCmd = navigator.platform?.toLowerCase().includes('win')
      ? 'irm https://toolguard-app.vercel.app/install.ps1 | iex'
      : 'curl -fsSL https://toolguard-app.vercel.app/install.sh | bash';

    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', pt: 8, pb: 6 }}>
        <Paper variant="outlined" sx={{ p: 4.5, borderRadius: '12px', backgroundColor: surface, borderColor: border, textAlign: 'center' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="ToolGuard"
            sx={{ width: 80, height: 80, borderRadius: '16px', objectFit: 'cover', mb: 2.5, border: `1px solid ${border}` }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', mb: 0.75 }}>
            No project connected yet
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, mb: 3, lineHeight: 1.7, maxWidth: 440, mx: 'auto' }}>
            Run one command in your terminal to protect your project from unauthorized tool capability changes.
          </Typography>

          <Box sx={{ backgroundColor: isDark ? '#0D0D0D' : '#F4F4F5', border: `1px solid ${border}`, borderRadius: '8px', px: 2.5, py: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'left' }}>
            <code style={{ flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.84rem', color: isDark ? '#A8E6CF' : '#065F46', wordBreak: 'break-all' }}>
              {installCmd}
            </code>
            <Tooltip title={copiedCmd ? 'Copied!' : 'Copy'}>
              <IconButton size="small" onClick={() => handleCopyCmd(installCmd)} sx={{ color: copiedCmd ? accent : textMuted, flexShrink: 0 }}>
                {copiedCmd ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              disabled={isVerifying}
              startIcon={isVerifying ? <CircularProgress size={13} color="inherit" /> : <CodeIcon sx={{ fontSize: 16 }} />}
              onClick={() => loadIdeWorkspace()}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '7px', px: 2.5, py: 0.85, backgroundColor: accent, color: isDark ? '#121212' : '#fff', boxShadow: 'none', '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' } }}
            >
              {isVerifying ? 'Connecting…' : 'Load Active IDE Project'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/integrations')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '7px', px: 2.5, py: 0.85, borderColor: border, color: textMuted, '&:hover': { borderColor: accent, color: accent } }}
            >
              Step-by-Step Setup →
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Overview
            </Typography>
            {currentWorkspace && (
              <Chip
                size="small"
                icon={<FolderOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                label={currentWorkspace.name}
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  borderRadius: '6px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  color: 'text.primary',
                  border: `1px solid ${border}`,
                }}
              />
            )}
            <Chip
              size="small"
              label={isProtected ? '✓ Baseline verified' : `⚠ ${openDrift.length} drift detected`}
              sx={{
                height: 22, fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                backgroundColor: isProtected
                  ? (isDark ? 'rgba(62,207,142,0.12)' : 'rgba(0,196,117,0.08)')
                  : (isDark ? 'rgba(250,82,82,0.12)' : 'rgba(220,38,38,0.08)'),
                color: isProtected ? accent : danger,
                border: `1px solid ${isProtected
                  ? (isDark ? 'rgba(62,207,142,0.3)' : 'rgba(0,196,117,0.25)')
                  : (isDark ? 'rgba(250,82,82,0.3)' : 'rgba(220,38,38,0.25)')}`,
              }}
            />
            {isLocalConnected && (
              <Chip
                size="small"
                label="● Live IDE Sync"
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, borderRadius: '6px', backgroundColor: isDark ? 'rgba(62,207,142,0.1)' : 'rgba(0,196,117,0.06)', color: accent, border: `1px solid ${isDark ? 'rgba(62,207,142,0.25)' : 'rgba(0,196,117,0.2)'}` }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: textMuted }}>
            {activeStatuses.length} tools monitored · SHA-256 cryptographic baseline · Active version: <strong>{currentVersionTag}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={(scanning || isVerifying) ? <CircularProgress size={13} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
            onClick={handleScan}
            disabled={scanning || isVerifying}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.84rem', borderRadius: '7px', px: 2, py: 0.75, backgroundColor: accent, color: isDark ? '#121212' : '#fff', boxShadow: 'none', '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' } }}
          >
            {(scanning || isVerifying) ? 'Scanning…' : 'Run Scan'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryIcon sx={{ fontSize: 15 }} />}
            onClick={() => setVersionHistoryOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              borderRadius: '7px',
              px: 1.75,
              py: 0.75,
              borderColor: border,
              color: 'text.primary',
              '&:hover': { borderColor: accent, color: accent }
            }}
          >
            Version History ({currentVersionTag})
          </Button>

          {!isProtected && (
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate('/drift')}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', borderRadius: '7px', px: 2, py: 0.75, borderColor: danger, color: danger, '&:hover': { backgroundColor: isDark ? 'rgba(250,82,82,0.06)' : 'rgba(220,38,38,0.04)' } }}
            >
              Review Drift ({openDrift.length})
            </Button>
          )}
          {!isProtected && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
              onClick={handleReset}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', borderRadius: '7px', px: 2, py: 0.75, borderColor: border, color: textMuted, '&:hover': { borderColor: accent, color: accent } }}
            >
              Restore
            </Button>
          )}
          <Button
            variant="text"
            size="small"
            startIcon={<LinkOffIcon sx={{ fontSize: 14 }} />}
            onClick={() => setConfirmDisconnect(true)}
            sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.82rem', color: textMuted, '&:hover': { color: danger } }}
          >
            Disconnect
          </Button>
        </Box>
      </Box>

      {/* Scan Feedback */}
      {scanFeedback && (
        <Alert
          severity={scanFeedback.severity}
          onClose={() => setScanFeedback(null)}
          sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.84rem', border: `1px solid ${scanFeedback.severity === 'error' ? (isDark ? 'rgba(250,82,82,0.3)' : 'rgba(220,38,38,0.2)') : (isDark ? 'rgba(62,207,142,0.3)' : 'rgba(0,196,117,0.2)')}` }}
        >
          {scanFeedback.message}
        </Alert>
      )}

      {/* Drift Alert Banner */}
      {openDrift.length > 0 && (
        <Paper
          variant="outlined"
          sx={{ mb: 2.5, borderRadius: '10px', backgroundColor: isDark ? 'rgba(250,82,82,0.07)' : 'rgba(220,38,38,0.04)', borderColor: isDark ? 'rgba(250,82,82,0.35)' : 'rgba(220,38,38,0.25)', overflow: 'hidden' }}
        >
          <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 24, color: danger, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: danger }}>
                  {openDrift.length} tool{openDrift.length > 1 ? 's have' : ' has'} unauthorized capability changes
                </Typography>
                <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.8rem', mt: 0.2 }}>
                  Affected: {openDrift.map(e => e.toolName).join(', ')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="text"
                endIcon={showDiff ? <KeyboardArrowUpIcon sx={{ fontSize: 14 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />}
                onClick={() => setShowDiff(p => !p)}
                sx={{ textTransform: 'none', fontSize: '0.8rem', color: textMuted, fontWeight: 500, '&:hover': { color: 'text.primary' } }}
              >
                {showDiff ? 'Hide Diff' : 'Inspect Diff'}
              </Button>
              <Button size="small" variant="contained"
                disabled={isAcceptingOverviewDrift}
                startIcon={isAcceptingOverviewDrift ? <CircularProgress size={12} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 14 }} />}
                onClick={handleAcceptAllDrift}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '7px',
                  px: 2,
                  py: 0.6,
                  backgroundColor: accent,
                  color: isDark ? '#121212' : '#FFFFFF',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' }
                }}
              >
                {isAcceptingOverviewDrift ? 'Updating…' : 'Accept Drift'}
              </Button>
              <Button size="small" variant="contained"
                onClick={() => navigate('/drift')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', borderRadius: '7px', px: 2, py: 0.6, backgroundColor: danger, color: '#fff', boxShadow: 'none', '&:hover': { backgroundColor: '#c81e1e', boxShadow: 'none' } }}
              >
                Review in Drift Inspector →
              </Button>
              <Button size="small" variant="outlined"
                onClick={handleReset}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderRadius: '7px', borderColor: border, color: textMuted, '&:hover': { borderColor: accent, color: accent } }}
              >
                Restore Baseline
              </Button>
            </Box>
          </Box>
          <Collapse in={showDiff} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2.5, pb: 2.5, borderTop: `1px solid ${isDark ? 'rgba(250,82,82,0.2)' : 'rgba(220,38,38,0.15)'}`, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {openDrift.map(event => {
                const currentTool = tools.find(t => (t.id && t.id === event.toolId) || t.name === event.toolName);
                let baselineDef = baseline?.tools?.[event.toolId]?.normalizedDefinition;
                if (!baselineDef && baseline?.tools) {
                  const found = Object.values(baseline.tools).find(e => e.toolId === event.toolId || e.name === event.toolName);
                  if (found) baselineDef = found.normalizedDefinition;
                }
                const baselineTool = baselineDef || {
                  status: 'NOT_IN_BASELINE',
                  securityAlert: 'UNAUTHORIZED CAPABILITY INJECTION',
                  note: 'This tool does not exist in the frozen baseline.',
                  toolName: event.toolName,
                };
                return (
                  <DiffViewer
                    key={event.eventId}
                    baselineJson={baselineTool}
                    currentJson={currentTool || { name: event.toolName, changes: event.changes }}
                    baselineTitle="Trusted Baseline"
                    currentTitle={`Live: ${event.toolName}`}
                  />
                );
              })}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Safe Banner */}
      {isProtected && activeStatuses.length > 0 && (
        <Alert
          severity="success"
          icon={<ShieldIcon sx={{ fontSize: 18 }} />}
          sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.84rem', border: `1px solid ${isDark ? 'rgba(62,207,142,0.25)' : '#A7F3D0'}`, backgroundColor: isDark ? 'rgba(62,207,142,0.06)' : '#ECFDF5' }}
        >
          All {activeStatuses.length} tools match the trusted baseline — workspace is secure.
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Total Tools',
            value: activeStatuses.length,
            sub: `${tools.filter(t => t.permissions?.includes('admin')).length} privileged`,
            icon: <LayersOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />,
            danger: false,
          },
          {
            label: 'Drift Detected',
            value: openDrift.length,
            sub: openDrift.length === 0 ? 'All clear' : 'Action required',
            icon: openDrift.length > 0
              ? <WarningAmberIcon sx={{ fontSize: 18, color: danger }} />
              : <ShieldOutlinedIcon sx={{ fontSize: 18, color: accent }} />,
            danger: openDrift.length > 0,
          },
          {
            label: 'Baseline Version',
            value: currentVersionTag,
            sub: `${versionHistory.length} revision${versionHistory.length > 1 ? 's' : ''} logged`,
            icon: <HistoryIcon sx={{ fontSize: 18, color: accent }} />,
            danger: false,
          },
          {
            label: 'Last Scan',
            value: lastScanTime,
            sub: 'Continuous monitoring',
            icon: <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />,
            danger: false,
            small: true,
          },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: surface,
                borderColor: s.danger ? (isDark ? 'rgba(250,82,82,0.3)' : 'rgba(220,38,38,0.2)') : border,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </Typography>
                {s.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: s.small ? '1.05rem' : '1.5rem', color: s.danger ? danger : 'text.primary', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.74rem', mt: 0.5, display: 'block' }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tool List */}
      <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: surface, borderColor: border }}>
        {/* Toolbar */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', backgroundColor: surfaceBg }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.88rem' }}>
            Tool Manifest ({activeStatuses.length})
          </Typography>
          <TextField
            size="small"
            placeholder="Search tools…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: textMuted }} /></InputAdornment>
            }}
            sx={{
              width: { xs: '100%', sm: 220 },
              '& .MuiOutlinedInput-root': { borderRadius: '7px', fontSize: '0.82rem', backgroundColor: surface, '& fieldset': { borderColor: border }, '&.Mui-focused fieldset': { borderColor: accent } }
            }}
          />
        </Box>

        {isVerifying && (
          <LinearProgress sx={{ height: 2, backgroundColor: 'transparent', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3ECF8E 0%, #3E7BFA 50%, #3ECF8E 100%)' } }} />
        )}

        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: surfaceBg }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tool
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Permissions
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: textMuted, py: 1.2, borderBottom: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6, color: textMuted, fontSize: '0.84rem' }}>
                  {searchQuery ? 'No tools match your search.' : 'No tools discovered yet. Run a scan to detect tools.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => {
                const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
                const isDrifted = tool.driftDetected;

                return (
                  <TableRow
                    key={tool.toolId}
                    hover
                    sx={{
                      '& td': { borderBottom: `1px solid ${border}`, py: 1.25 },
                      backgroundColor: isDrifted
                        ? (isDark ? 'rgba(250,82,82,0.04)' : 'rgba(220,38,38,0.02)')
                        : 'transparent',
                    }}
                  >
                    {/* Tool Name */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                          backgroundColor: isDrifted ? danger : accent,
                        }} />
                        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem', fontFamily: '"JetBrains Mono", monospace' }}>
                          {tool.name}
                        </Typography>
                        {isDrifted && (
                          <Chip label={`${tool.changes?.length || 1} change${(tool.changes?.length || 1) > 1 ? 's' : ''}`} size="small"
                            sx={{ height: 18, fontSize: '0.64rem', fontWeight: 600, borderRadius: '4px', backgroundColor: isDark ? 'rgba(250,82,82,0.15)' : 'rgba(220,38,38,0.08)', color: danger }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Status */}
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
                            <Chip key={perm} label={perm} size="small" sx={{
                              height: 20, fontSize: '0.68rem', fontWeight: 500, borderRadius: '4px',
                              backgroundColor: isAdm
                                ? (isDark ? 'rgba(250,82,82,0.12)' : 'rgba(220,38,38,0.08)')
                                : isNet
                                ? (isDark ? 'rgba(245,166,35,0.12)' : 'rgba(217,119,6,0.08)')
                                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                              color: isAdm ? danger : isNet ? warning : textMuted,
                              border: `1px solid ${isAdm ? (isDark ? 'rgba(250,82,82,0.25)' : 'rgba(220,38,38,0.2)') : border}`,
                            }} />
                          );
                        }) || <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                      </Box>
                    </TableCell>

                    {/* Delete */}
                    <TableCell align="right">
                      <Tooltip title="Remove from tracking">
                        <IconButton size="small" onClick={() => setToolToDelete(tool)}
                          sx={{ color: textMuted, p: 0.6, borderRadius: '6px', '&:hover': { color: danger, backgroundColor: isDark ? 'rgba(250,82,82,0.1)' : 'rgba(220,38,38,0.06)' } }}
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
      <Dialog open={Boolean(toolToDelete)} onClose={() => setToolToDelete(null)}
        PaperProps={{ sx: { backgroundColor: surface, borderColor: border, borderWidth: 1, borderStyle: 'solid', borderRadius: '10px', maxWidth: 420, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', pb: 1 }}>Remove Tool</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.84rem' }}>
            Remove <strong>{toolToDelete?.name}</strong> from monitoring? The baseline will be recalculated.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button size="small" onClick={() => setToolToDelete(null)} sx={{ textTransform: 'none', color: textMuted, fontWeight: 500 }}>Cancel</Button>
          <Button variant="contained" size="small"
            onClick={() => { if (toolToDelete) { deleteTool(toolToDelete.toolId); setToolToDelete(null); } }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '7px', backgroundColor: danger, boxShadow: 'none', '&:hover': { backgroundColor: '#c81e1e', boxShadow: 'none' } }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={confirmDisconnect} onClose={() => setConfirmDisconnect(false)}
        PaperProps={{ sx: { backgroundColor: surface, borderColor: border, borderWidth: 1, borderStyle: 'solid', borderRadius: '10px', maxWidth: 420, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', pb: 1 }}>Disconnect Project?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.84rem' }}>
            This will unlink <strong>{activeWorkspace?.name}</strong> from ToolGuard. Monitoring will stop.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button size="small" onClick={() => setConfirmDisconnect(false)} sx={{ textTransform: 'none', color: textMuted, fontWeight: 500 }}>Cancel</Button>
          <Button variant="contained" size="small"
            onClick={() => { setConfirmDisconnect(false); disconnectProject(); }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '7px', backgroundColor: danger, boxShadow: 'none', '&:hover': { backgroundColor: '#c81e1e', boxShadow: 'none' } }}
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── BASELINE VERSION HISTORY DIALOG ────────────────────────────────────────── */}
      <Dialog
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '12px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{
              p: 1,
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(62,207,142,0.12)' : 'rgba(0,196,117,0.1)',
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HistoryIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
                  Baseline Version History
                </Typography>
                <Chip
                  size="small"
                  label={`Current: ${currentVersionTag}`}
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    backgroundColor: isDark ? 'rgba(62,207,142,0.15)' : 'rgba(0,196,117,0.12)',
                    color: accent,
                    border: `1px solid ${isDark ? 'rgba(62,207,142,0.3)' : 'rgba(0,196,117,0.25)'}`,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.8rem', mt: 0.25 }}>
                Cryptographic audit trail showing at what version what capability changes were accepted.
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setVersionHistoryOpen(false)} sx={{ color: textMuted }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          {versionHistory.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ color: textMuted, fontSize: '0.88rem' }}>
                No version history recorded yet. Initialize a baseline or accept changes to record versions.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {versionHistory.map((ver, idx) => {
                const isCurrent = ver.versionTag === currentVersionTag;
                return (
                  <Paper
                    key={`${ver.version}-${idx}`}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: '10px',
                      backgroundColor: isCurrent ? (isDark ? 'rgba(62,207,142,0.03)' : '#F9FDFB') : surfaceBg,
                      borderColor: isCurrent ? accent : border,
                      borderWidth: isCurrent ? 2 : 1,
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={ver.versionTag}
                          size="small"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 750,
                            fontSize: '0.78rem',
                            height: 24,
                            backgroundColor: isCurrent ? accent : (isDark ? '#262626' : '#E5E7EB'),
                            color: isCurrent ? (isDark ? '#121212' : '#FFFFFF') : 'text.primary',
                          }}
                        />
                        {isCurrent && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: `${accent} !important` }} />}
                            label="ACTIVE BASELINE"
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.66rem',
                              fontWeight: 750,
                              letterSpacing: '0.04em',
                              backgroundColor: isDark ? 'rgba(62,207,142,0.12)' : 'rgba(0,196,117,0.1)',
                              color: accent,
                              border: `1px solid ${isDark ? 'rgba(62,207,142,0.3)' : 'rgba(0,196,117,0.25)'}`,
                            }}
                          />
                        )}
                        <Chip
                          label={
                            ver.action === 'ACCEPTED_DRIFT'
                              ? 'ACCEPTED CHANGES'
                              : (ver.action === 'INITIALIZED' ? 'INITIAL BASELINE' : 'UPDATED BASELINE')
                          }
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            backgroundColor: ver.action === 'ACCEPTED_DRIFT'
                              ? (isDark ? 'rgba(62,207,142,0.15)' : 'rgba(0,196,117,0.12)')
                              : (isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'),
                            color: ver.action === 'ACCEPTED_DRIFT' ? accent : '#3B82F6',
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ color: textMuted, fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace' }}>
                          {formatDateTime(ver.timestamp)}
                        </Typography>
                        <Chip
                          label={ver.actor}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.66rem',
                            color: textMuted,
                            backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
                            border: `1px solid ${border}`
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Title & Description */}
                    <Typography sx={{ fontWeight: 650, fontSize: '0.9rem', color: 'text.primary', mb: 1 }}>
                      {ver.title}
                    </Typography>

                    {/* Changes details list (what was changed at this version) */}
                    {ver.changes && ver.changes.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, my: 1.5 }}>
                        {ver.changes.map((c, cIdx) => (
                          <Box
                            key={cIdx}
                            sx={{
                              p: 1.25,
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#141414' : '#F4F4F5',
                              border: `1px solid ${border}`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.25,
                            }}
                          >
                            <Chip
                              label={c.changeType.toUpperCase()}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: 750,
                                mt: 0.2,
                                backgroundColor: c.changeType === 'added'
                                  ? (isDark ? 'rgba(62,207,142,0.15)' : 'rgba(0,196,117,0.15)')
                                  : (c.changeType === 'removed'
                                    ? (isDark ? 'rgba(250,82,82,0.15)' : 'rgba(220,38,38,0.12)')
                                    : (isDark ? 'rgba(245,166,35,0.15)' : 'rgba(217,119,6,0.12)')),
                                color: c.changeType === 'added'
                                  ? accent
                                  : (c.changeType === 'removed' ? danger : warning)
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
                                Tool: <code style={{ fontFamily: '"JetBrains Mono", monospace', color: accent }}>{c.toolName}</code>
                              </Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: textMuted }}>
                                {c.summary}
                              </Typography>
                              {(c.before !== undefined || c.after !== undefined) && (
                                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                  {c.before !== undefined && (
                                    <Box sx={{ flex: 1, minWidth: 200, p: 1, borderRadius: '4px', backgroundColor: isDark ? '#1F1414' : '#FEF2F2', border: `1px solid ${isDark ? '#4A1D1D' : '#FECACA'}` }}>
                                      <Typography variant="caption" sx={{ color: danger, fontWeight: 700, display: 'block', mb: 0.25 }}>
                                        Previous Baseline:
                                      </Typography>
                                      <code style={{ fontSize: '0.72rem', color: danger, fontFamily: '"JetBrains Mono", monospace', wordBreak: 'break-all' }}>
                                        {typeof c.before === 'string' ? c.before : JSON.stringify(c.before)}
                                      </code>
                                    </Box>
                                  )}
                                  {c.after !== undefined && (
                                    <Box sx={{ flex: 1, minWidth: 200, p: 1, borderRadius: '4px', backgroundColor: isDark ? '#141E18' : '#F0FDF4', border: `1px solid ${isDark ? '#1E3A2B' : '#BBF7D0'}` }}>
                                      <Typography variant="caption" sx={{ color: accent, fontWeight: 700, display: 'block', mb: 0.25 }}>
                                        Accepted (New Baseline):
                                      </Typography>
                                      <code style={{ fontSize: '0.72rem', color: accent, fontFamily: '"JetBrains Mono", monospace', wordBreak: 'break-all' }}>
                                        {typeof c.after === 'string' ? c.after : JSON.stringify(c.after)}
                                      </code>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Footer / Hash */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${border}`, flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: textMuted }}>
                        Manifest: <strong>{ver.toolCount}</strong> tool capabilities protected
                      </Typography>
                      {ver.baselineHash && (
                        <Typography sx={{ fontSize: '0.7rem', color: textMuted, fontFamily: '"JetBrains Mono", monospace' }}>
                          Hash: <code>{ver.baselineHash}</code>
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, borderTop: `1px solid ${border}` }}>
          <Button
            onClick={() => setVersionHistoryOpen(false)}
            sx={{ textTransform: 'none', color: textMuted, fontSize: '0.84rem' }}
          >
            Close
          </Button>
          {!isProtected && (
            <Button
              variant="contained"
              size="small"
              onClick={() => { setVersionHistoryOpen(false); navigate('/drift'); }}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', backgroundColor: danger, color: '#fff', '&:hover': { backgroundColor: '#c81e1e' } }}
            >
              Review Open Drift ({openDrift.length}) →
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
