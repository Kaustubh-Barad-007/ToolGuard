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
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
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
          message: `🚨 Drift Detected: ${result.driftCount} tool manifest(s) deviate from the trusted SHA-256 baseline. Review immediately.`
        });
      } else {
        setScanFeedback({
          severity: 'success',
          message: `✓ Verification Scan Complete: All ${result.totalTools} tool capabilities match the immutable SHA-256 baseline (SAFE).`
        });
      }
    }
  };

  const handleSimulate = async () => {
    await simulateDrift();
    setScanFeedback({
      severity: 'error',
      message: '🚨 Simulated Attack Injected: Unauthorized capability expansion on npm:dev detected. Status updated to TRUST DRIFT.'
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

  // ── Color tokens ──────────────────────────────────────────────────────────
  const border        = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(210, 218, 235, 0.85)';
  const surface       = isDark ? '#0D1220' : '#ffffff';
  const surfaceMuted  = isDark ? '#080B14' : '#F7F8FC';
  const accentPrimary = isDark ? '#00D4AA' : '#008B72';
  const accentViolet  = isDark ? '#7C5CFC' : '#5B3FD4';
  const dangerColor   = isDark ? '#FF4D6A' : '#D63051';
  const warningColor  = isDark ? '#FFB340' : '#CC8A1E';
  const textMuted     = isDark ? '#6B7A99' : '#5A6578';

  // ── Filter tools by search & permission boundary ──────────────────────────
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

  // ── Empty / Not connected state ───────────────────────────────────────────
  if (!activeWorkspace || scanStatuses.length === 0) {
    const installScript = `npm install -g https://toolguard-app.vercel.app/toolguard.tgz\ntoolguard init -y\ntoolguard scan`;

    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', pt: 6, pb: 4, textAlign: 'center' }}>
        <Box sx={{
          width: 76,
          height: 76,
          borderRadius: '22px',
          background: `linear-gradient(135deg, ${accentPrimary} 0%, ${isDark ? '#008B72' : '#006B5A'} 100%)`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: `0 12px 32px ${accentPrimary}40`,
          animation: 'floatSlow 6s ease-in-out infinite'
        }}>
          <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 40 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5, color: 'text.primary', letterSpacing: '-0.03em' }}>
          Connect a Project to ToolGuard
        </Typography>
        <Typography variant="body1" sx={{ color: textMuted, mb: 4, lineHeight: 1.7, maxWidth: 540, mx: 'auto', fontSize: '1rem' }}>
          Zero-trust capability verification for developer tools &amp; AI agents. Freeze tool definitions into deterministic SHA-256 baselines and detect drift before execution.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 4.5 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<HubOutlinedIcon />}
            onClick={() => navigate('/integrations')}
            sx={{
              textTransform: 'none',
              fontWeight: 750,
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              fontSize: '0.92rem',
              boxShadow: `0 4px 16px ${accentPrimary}35`
            }}
          >
            Connect Project (IDE / CLI)
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<BoltIcon sx={{ color: warningColor }} />}
            onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
            sx={{
              textTransform: 'none',
              fontWeight: 750,
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              fontSize: '0.92rem',
              borderColor: `${warningColor}60`,
              color: warningColor,
              backgroundColor: `${warningColor}08`,
              '&:hover': { borderColor: warningColor, backgroundColor: `${warningColor}15` }
            }}
          >
            ⚡ 1-Click Evaluation Demo
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'left',
            borderRadius: '16px',
            backgroundColor: surface,
            borderColor: border,
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(13,17,23,0.06)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: textMuted, letterSpacing: '0.06em', fontSize: '0.72rem' }}>
              UNIVERSAL CLI INSTALL &amp; INITIALIZE
            </Typography>
            <Tooltip title={copiedCmd ? 'Copied Commands!' : 'Copy Commands'}>
              <IconButton size="small" onClick={() => handleCopyCmd(installScript)} sx={{ color: textMuted, '&:hover': { color: accentPrimary } }}>
                {copiedCmd ? <CheckIcon sx={{ fontSize: 17, color: accentPrimary }} /> : <ContentCopyIcon sx={{ fontSize: 17 }} />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2.2,
              borderRadius: '10px',
              backgroundColor: surfaceMuted,
              border: `1px solid ${border}`,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.82rem',
              color: accentViolet,
              overflowX: 'auto',
              lineHeight: 1.8
            }}
          >
            {installScript}
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Connected state metrics ───────────────────────────────────────────────
  const stats = [
    {
      label: 'Monitored Tools',
      value: scanStatuses.length,
      sub: 'Active in project workspace',
      accent: accentPrimary,
      icon: <FolderOpenOutlinedIcon sx={{ fontSize: 20, color: accentPrimary }} />,
      iconBg: `${accentPrimary}15`
    },
    {
      label: 'Baseline Fingerprint',
      value: `v${baseline?.version || 1}`,
      sub: 'SHA-256 immutable freeze',
      accent: accentViolet,
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: accentViolet }} />,
      iconBg: `${accentViolet}15`
    },
    {
      label: 'Trust Drift Incidents',
      value: openDrift.length,
      sub: openDrift.length === 0 ? 'All capabilities verified' : 'Action required immediately',
      danger: openDrift.length > 0,
      accent: openDrift.length > 0 ? dangerColor : accentPrimary,
      icon: openDrift.length > 0
        ? <WarningAmberIcon sx={{ fontSize: 20, color: dangerColor }} />
        : <CheckCircleOutlineIcon sx={{ fontSize: 20, color: accentPrimary }} />,
      iconBg: openDrift.length > 0 ? `${dangerColor}15` : `${accentPrimary}15`
    },
    {
      label: 'Last Verification',
      value: lastScanTime,
      sub: 'Autonomous continuous watch',
      small: true,
      accent: warningColor,
      icon: <HistoryOutlinedIcon sx={{ fontSize: 20, color: warningColor }} />,
      iconBg: `${warningColor}15`
    },
  ];

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
      {/* ── 1. HEADER BANNER ─────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.03em' }}>
              {activeWorkspace.name}
            </Typography>
            <Chip
              icon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isProtected ? accentPrimary : dangerColor, animation: 'radarPing 1.8s infinite', mr: 0.5 }} />}
              label={isProtected ? 'CRYPTOGRAPHICALLY PROTECTED' : 'UNAUTHORIZED CAPABILITY DRIFT'}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                borderRadius: '7px',
                backgroundColor: isProtected ? `${accentPrimary}12` : `${dangerColor}12`,
                color: isProtected ? accentPrimary : dangerColor,
                border: `1px solid ${isProtected ? `${accentPrimary}35` : `${dangerColor}35`}`,
                letterSpacing: '0.04em'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: textMuted, fontWeight: 500 }}>
            Stack: <strong>{activeWorkspace.stack}</strong> · <strong>{scanStatuses.length} tool capabilities</strong> locked under SHA-256 verification
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpOutlineIcon sx={{ fontSize: '15px !important' }} />}
            onClick={() => setShowGuide(!showGuide)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '0.82rem',
              borderColor: border,
              color: textMuted,
              '&:hover': { borderColor: accentPrimary, color: 'text.primary' }
            }}
          >
            {showGuide ? 'Hide Guide' : 'How It Works'}
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={scanning ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: '15px !important' }} />}
            onClick={handleScan}
            disabled={scanning}
            sx={{
              textTransform: 'none',
              fontWeight: 750,
              borderRadius: '8px',
              fontSize: '0.82rem',
              px: 2,
              py: 0.75,
              animation: scanning ? 'none' : 'glowPulse 3s ease-in-out infinite',
            }}
          >
            {scanning ? 'Verifying Hashes…' : 'Run Verification Scan'}
          </Button>

          {!isProtected ? (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/drift')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  px: 2,
                  backgroundColor: dangerColor,
                  '&:hover': { backgroundColor: '#B01E3C' }
                }}
              >
                Inspect {openDrift.length} Drift Alert{openDrift.length > 1 ? 's' : ''} →
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                onClick={handleReset}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  borderColor: border,
                  color: textMuted,
                  '&:hover': { borderColor: accentPrimary, color: 'text.primary' }
                }}
              >
                Restore Baseline
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<BoltIcon sx={{ fontSize: '15px !important', color: warningColor }} />}
              onClick={handleSimulate}
              sx={{
                textTransform: 'none',
                fontWeight: 750,
                borderRadius: '8px',
                fontSize: '0.82rem',
                borderColor: `${warningColor}45`,
                color: warningColor,
                backgroundColor: `${warningColor}0A`,
                '&:hover': { borderColor: warningColor, backgroundColor: `${warningColor}15` }
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
              borderColor: `${dangerColor}30`,
              color: dangerColor,
              backgroundColor: `${dangerColor}06`,
              '&:hover': {
                borderColor: dangerColor,
                backgroundColor: `${dangerColor}12`
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
          sx={{
            mb: 3,
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.86rem',
            border: `1px solid ${scanFeedback.severity === 'error' ? `${dangerColor}40` : `${accentPrimary}40`}`,
            backgroundColor: scanFeedback.severity === 'error' ? `${dangerColor}0C` : `${accentPrimary}0C`,
          }}
        >
          {scanFeedback.message}
        </Alert>
      )}

      {/* ── 2. ARCHITECTURE & DEFENSE PILLARS GUIDE ───────────────────────────── */}
      {showGuide && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 3.5,
            borderRadius: '16px',
            backgroundColor: surface,
            borderColor: border,
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 8px 24px rgba(13,17,23,0.06)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: `${accentPrimary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldOutlinedIcon sx={{ color: accentPrimary, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  How ToolGuard Protects Developer &amp; Agent Tooling
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Three interlocking cryptographic defensive rings
                </Typography>
              </Box>
            </Box>
            <Chip
              label="Continuous Autonomous Defense"
              size="small"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: `${accentPrimary}12`,
                color: accentPrimary,
                border: `1px solid ${accentPrimary}30`
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.2, borderRadius: '12px', backgroundColor: `${accentViolet}08`, border: `1px solid ${accentViolet}22`, height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 850, color: accentViolet, display: 'block', mb: 0.75, letterSpacing: '0.06em' }}>
                  1. CRYPTOGRAPHIC FREEZING
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: textMuted, lineHeight: 1.65 }}>
                  Discovers all npm scripts, MCP agent tools, and task runners, hashing parameter definitions into deterministic SHA-256 signatures via <code>toolguard init</code>.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.2, borderRadius: '12px', backgroundColor: `${accentPrimary}08`, border: `1px solid ${accentPrimary}22`, height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 850, color: accentPrimary, display: 'block', mb: 0.75, letterSpacing: '0.06em' }}>
                  2. MULTI-SURFACE MONITORING
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: textMuted, lineHeight: 1.65 }}>
                  Continuous active monitoring across <strong>VS Code &amp; Cursor status bar</strong>, <strong>Git pre-commit gates</strong>, and CLI background watch.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.2, borderRadius: '12px', backgroundColor: `${dangerColor}08`, border: `1px solid ${dangerColor}22`, height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 850, color: dangerColor, display: 'block', mb: 0.75, letterSpacing: '0.06em' }}>
                  3. ZERO-TRUST GATE ENFORCEMENT
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: textMuted, lineHeight: 1.65 }}>
                  If a tool secretly expands capabilities (e.g. remote network egress or elevated admin rights), ToolGuard flags it in &lt;10ms and halts execution.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.78rem' }}>
              ⚡ <strong>Test verification:</strong> Click <em>"Simulate Threat"</em> above or run <code>toolguard threat-test</code> in your terminal.
            </Typography>
            <Button size="small" onClick={() => setShowGuide(false)} sx={{ textTransform: 'none', fontSize: '0.76rem', color: textMuted, fontWeight: 700 }}>
              Dismiss Guide
            </Button>
          </Box>
        </Paper>
      )}

      {/* Drift Alert Banner */}
      {!isProtected && (
        <Alert
          severity="error"
          variant="outlined"
          action={
            <Button
              color="error"
              size="small"
              onClick={() => navigate('/drift')}
              sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              Inspect Security Diff →
            </Button>
          }
          sx={{
            mb: 3.5,
            borderRadius: '12px',
            fontSize: '0.88rem',
            borderColor: `${dangerColor}55`,
            backgroundColor: `${dangerColor}0C`
          }}
        >
          <strong>Trust Drift Incident Alert:</strong> Detected {openDrift.length} unauthorized capability alteration(s) violating the baseline fingerprint.
        </Alert>
      )}

      {/* ── 3. METRIC BENTO CARDS ────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: surface,
                borderColor: border,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(13, 17, 23, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: s.accent,
                  boxShadow: isDark
                    ? `0 14px 32px rgba(0,0,0,0.5), 0 0 20px ${s.accent}20`
                    : `0 10px 25px rgba(13, 17, 23, 0.08)`,
                }
              }}
            >
              {/* Subtle top indicator */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: s.accent }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                  {s.label.toUpperCase()}
                </Typography>
                <Box sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  backgroundColor: s.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {s.icon}
                </Box>
              </Box>

              <Typography sx={{
                fontWeight: 850,
                fontSize: s.small ? '1.05rem' : '1.8rem',
                color: s.danger ? dangerColor : 'text.primary',
                fontFamily: '"JetBrains Mono", monospace',
                lineHeight: 1.15,
                letterSpacing: '-0.03em'
              }}>
                {s.value}
              </Typography>

              <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.74rem', fontWeight: 550, mt: 0.75, display: 'block' }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── 4. SEARCH & FILTER TOOLBAR ────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          mb: 2.5,
          borderRadius: '14px',
          backgroundColor: surface,
          borderColor: border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(13,17,23,0.03)'
        }}
      >
        <TextField
          size="small"
          placeholder="Filter tools by identifier or command..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: textMuted }} />
              </InputAdornment>
            )
          }}
          sx={{
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '9px',
              fontSize: '0.84rem',
              backgroundColor: surfaceMuted,
              '& fieldset': { borderColor: border },
              '&:hover fieldset': { borderColor: accentPrimary },
              '&.Mui-focused fieldset': { borderColor: accentPrimary }
            }
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, mr: 0.5, fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            PERMISSION BOUNDARY:
          </Typography>
          {[
            { label: 'All Capabilities', value: 'all' },
            { label: 'admin', value: 'admin' },
            { label: 'network', value: 'network' },
            { label: 'write', value: 'write' },
            { label: 'execute', value: 'execute' }
          ].map(filterItem => {
            const isSelected = selectedPermission === filterItem.value;
            return (
              <Chip
                key={filterItem.value}
                label={filterItem.label}
                size="small"
                clickable
                onClick={() => setSelectedPermission(filterItem.value)}
                sx={{
                  height: 25,
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  borderRadius: '7px',
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(0, 212, 170, 0.15)' : 'rgba(0, 139, 114, 0.1)')
                    : 'transparent',
                  color: isSelected ? accentPrimary : textMuted,
                  border: isSelected ? `1px solid ${accentPrimary}` : `1px solid ${border}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: accentPrimary,
                    color: 'text.primary'
                  }
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* ── 5. TOOLS CAPABILITY MANIFEST TABLE ─────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: surface,
          borderColor: border,
          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.45)' : '0 8px 30px rgba(13,17,23,0.06)'
        }}
      >
        <Box sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isDark ? '#0D1220' : '#ffffff'
        }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Tool Capability Manifest ({filteredTools.length} tools)
            </Typography>
            <Typography variant="caption" sx={{ color: textMuted }}>
              Cryptographic SHA-256 fingerprint &amp; runtime permission boundaries
            </Typography>
          </Box>
          <Chip
            label="SHA-256 ZERO-TRUST ENGINE"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.67rem',
              fontWeight: 800,
              backgroundColor: `${accentPrimary}12`,
              color: accentPrimary,
              border: `1px solid ${accentPrimary}30`
            }}
          />
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: surfaceMuted }}>
              {['Tool Identity', 'Integrity Status', 'Granted Permissions', 'Execution Boundary', 'Action'].map((h, idx) => (
                <TableCell
                  key={h}
                  align={idx === 4 ? 'right' : 'left'}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    color: textMuted,
                    py: 1.5,
                    borderBottom: `1px solid ${border}`,
                    letterSpacing: '0.04em'
                  }}
                >
                  {h.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: textMuted }}>
                  No tools match the selected search query or boundary filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => {
                const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
                return (
                  <TableRow
                    key={tool.toolId}
                    hover
                    sx={{
                      '& td': { borderBottom: `1px solid ${border}`, py: 1.6 },
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Tool Name */}
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.86rem', fontFamily: '"JetBrains Mono", monospace' }}>
                      {tool.name}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <StatusBadge status={tool.status} />
                    </TableCell>

                    {/* Granted Permissions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                        {toolDef?.permissions?.map((perm: string) => (
                          <Chip
                            key={perm}
                            label={perm}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 750,
                              borderRadius: '6px',
                              backgroundColor: perm === 'admin'
                                ? `${dangerColor}15`
                                : perm === 'network'
                                ? `${warningColor}15`
                                : perm === 'write'
                                ? `${accentViolet}15`
                                : `${accentPrimary}15`,
                              color: perm === 'admin'
                                ? dangerColor
                                : perm === 'network'
                                ? warningColor
                                : perm === 'write'
                                ? accentViolet
                                : accentPrimary,
                              border: `1px solid ${perm === 'admin'
                                ? `${dangerColor}30`
                                : perm === 'network'
                                ? `${warningColor}30`
                                : perm === 'write'
                                ? `${accentViolet}30`
                                : `${accentPrimary}30`}`
                            }}
                          />
                        )) || <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                      </Box>
                    </TableCell>

                    {/* Execution Boundary */}
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: textMuted }}>
                      <Box component="span" sx={{
                        px: 1.25,
                        py: 0.45,
                        borderRadius: '6px',
                        backgroundColor: surfaceMuted,
                        border: `1px solid ${border}`,
                        display: 'inline-block',
                        color: 'text.primary',
                        maxWidth: 320,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {toolDef?.execution?.command || toolDef?.endpoint || 'static declaration'}
                      </Box>
                    </TableCell>

                    {/* Delete Action */}
                    <TableCell align="right" sx={{ py: 0.75 }}>
                      <Tooltip title={`Completely delete ${tool.name} from project`}>
                        <IconButton
                          size="small"
                          onClick={() => setToolToDelete(tool)}
                          sx={{
                            color: textMuted,
                            p: 0.75,
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            '&:hover': {
                              color: dangerColor,
                              backgroundColor: `${dangerColor}12`
                            }
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
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

      {/* ── DELETE TOOL CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={Boolean(toolToDelete)}
        onClose={() => setToolToDelete(null)}
        PaperProps={{
          sx: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '16px',
            maxWidth: 460,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, fontSize: '1.1rem', color: 'text.primary', pb: 1, letterSpacing: '-0.02em' }}>
          Permanently Delete Tool?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.88rem', lineHeight: 1.65 }}>
            Are you sure you want to permanently remove <strong>{toolToDelete?.name}</strong> from this workspace?
            This will remove the tool definition and recalculate the SHA-256 cryptographic baseline.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setToolToDelete(null)}
            size="small"
            sx={{ textTransform: 'none', color: textMuted, fontWeight: 700 }}
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
              fontWeight: 750,
              borderRadius: '8px',
              px: 2.5,
              backgroundColor: dangerColor,
              '&:hover': { backgroundColor: '#B01E3C' }
            }}
          >
            Delete Tool
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DISCONNECT PROJECT CONFIRMATION DIALOG ───────────────────────────── */}
      <Dialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        PaperProps={{
          sx: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '16px',
            maxWidth: 460,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, fontSize: '1.1rem', color: 'text.primary', pb: 1, letterSpacing: '-0.02em' }}>
          Disconnect Project Workspace?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textMuted, fontSize: '0.88rem', lineHeight: 1.65 }}>
            Are you sure you want to completely disconnect <strong>{activeWorkspace?.name}</strong> from ToolGuard?
            This will reset this workspace to an unmonitored state and delete local hashes.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDisconnect(false)}
            size="small"
            sx={{ textTransform: 'none', color: textMuted, fontWeight: 700 }}
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
              fontWeight: 750,
              borderRadius: '8px',
              px: 2.5,
              backgroundColor: dangerColor,
              '&:hover': { backgroundColor: '#B01E3C' }
            }}
          >
            Disconnect Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
