import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

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
    acceptDriftEvent,
    baseline,
    activeWorkspace,
    exportActiveBaseline,
    disconnectProject,
    loadJudgeDemo
  } = useDemoData();

  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);
  const [confirmEvent, setConfirmEvent] = useState<{ eventId: string; toolId: string } | null>(null);

  const openDrift = driftEvents.filter(e => e.status === 'open');
  const isProtected = openDrift.length === 0;

  const handleScan = async () => {
    setScanning(true);
    await triggerScan();
    setScanning(false);
  };

  // If no workspace is connected, show clean Welcome / Connect screen
  if (!activeWorkspace || scanStatuses.length === 0) {
    return (
      <Box sx={{ maxWidth: 840, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
          }}
        >
          <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 38 }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
          Connect a Project to ToolGuard
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 580, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
          Zero-trust capability verification for developer scripts and AI tools. Freeze capabilities into a tamper-proof SHA-256 baseline and detect trust drift instantly.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 5 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<HubOutlinedIcon />}
            onClick={() => navigate('/integrations')}
            sx={{ px: 3.5, py: 1.25, fontWeight: 700 }}
          >
            Connect Your Project
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<BoltIcon sx={{ color: '#fff' }} />}
            onClick={() => {
              loadJudgeDemo();
              navigate('/drift');
            }}
            sx={{
              px: 3.5,
              py: 1.25,
              fontWeight: 750,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
              }
            }}
          >
            ⚡ Hackathon Judge Demo
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            maxWidth: 620,
            mx: 'auto',
            textAlign: 'left',
            borderRadius: 2,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Quick Start via Terminal:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: 1.5,
              backgroundColor: isDark ? '#0a0d14' : '#f1f5f9',
              color: isDark ? '#38bdf8' : '#0369a1',
              fontFamily: 'monospace',
              fontSize: '0.84rem',
              overflowX: 'auto',
              m: 0
            }}
          >
            {`# 1. Initialize baseline in your project
toolguard init -y

# 2. Scan tools against baseline
toolguard scan

# 3. Open this dashboard
toolguard dashboard`}
          </Box>
        </Paper>
      </Box>
    );
  }

  const filteredTools = scanStatuses.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1180 }}>
      {/* Top Welcome Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '-0.02em' }}>
              ToolGuard Dashboard
            </Typography>
            <Chip
              icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isProtected ? '#10b981' : '#ef4444', mr: 0.5 }} />}
              label={isProtected ? 'PROTECTED' : 'TRUST DRIFT DETECTED'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 750,
                backgroundColor: isProtected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: isProtected ? '#10b981' : '#ef4444',
                border: `1px solid ${isProtected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            />
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Zero-Trust Capability Verification & Automated Trust Drift Detection.
          </Typography>
        </Box>

        <Box>
          {!isProtected ? (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => navigate('/drift')}
              sx={{ px: 2.5, fontWeight: 750, textTransform: 'none' }}
            >
              Review Drift ({openDrift.length})
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleScan}
              disabled={scanning}
              sx={{ px: 2.5, fontWeight: 650, textTransform: 'none' }}
            >
              {scanning ? 'Scanning...' : 'Scan Tools'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Active Project Workspace Banner */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 750, color: 'text.primary' }}>
                {activeWorkspace.name}
              </Typography>
              <Chip
                label={activeWorkspace.stack}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6'
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeWorkspace.description} • <strong>{scanStatuses.length} tools monitored</strong> • Baseline v{baseline?.version || 1}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={exportActiveBaseline}
            sx={{
              textTransform: 'none',
              fontSize: '0.78rem',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.15)',
              color: 'text.primary'
            }}
          >
            Export baseline.json
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<LinkOffIcon sx={{ fontSize: 16 }} />}
            onClick={() => disconnectProject()}
            sx={{
              textTransform: 'none',
              fontSize: '0.78rem',
              fontWeight: 650
            }}
          >
            Disconnect
          </Button>
        </Box>
      </Box>

      {/* Critical Alert if Drift is Open */}
      {!isProtected && (
        <Alert
          severity="error"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/drift')}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Review Drift (Diff)
            </Button>
          }
          sx={{ mb: 3.5, borderRadius: 2 }}
        >
          <strong>Trust Drift Alert:</strong> Detected {openDrift.length} tool modification(s) violating the trusted baseline. Capabilities may have expanded without authorization.
        </Alert>
      )}

      {/* Metric Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Monitored Tools */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em' }}>
                MONITORED TOOLS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 750, mt: 0.75, color: 'text.primary' }}>
                {scanStatuses.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Active in workspace
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Baseline */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em' }}>
                ACTIVE BASELINE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 750, mt: 0.75, color: 'text.primary' }}>
                v{baseline?.version || 1}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                SHA-256 verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Trust Drift Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em' }}>
                TRUST DRIFT
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 750, mt: 0.75, color: openDrift.length > 0 ? '#ef4444' : '#10b981' }}>
                {openDrift.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {openDrift.length === 0 ? 'All capabilities match' : 'Action required'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Last Verified */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em' }}>
                LAST VERIFIED
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 750, mt: 1, color: 'text.primary' }}>
                {lastScanTime}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Continuous monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tool Capability Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary', fontSize: '1rem' }}>
              Tool Capability Manifest
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Cryptographically fingerprinted capabilities and runtime permissions
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{ width: 240 }}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>TOOL NAME</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>INTEGRITY STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>PERMISSIONS</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>EXECUTION COMMAND</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.map((tool) => {
              const toolDef = tools.find(t => (t.id || t.name) === tool.toolId || t.name === tool.name);
              return (
                <TableRow
                  key={tool.toolId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tools/${tool.toolId}`)}
                >
                  <TableCell sx={{ fontWeight: 650, color: 'text.primary' }}>
                    {tool.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tool.status} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {toolDef?.permissions?.map((perm: string) => (
                        <Chip
                          key={perm}
                          label={perm}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 650,
                            backgroundColor:
                              perm === 'admin'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : perm === 'network'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : perm === 'write'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              perm === 'admin'
                                ? '#ef4444'
                                : perm === 'network'
                                ? '#f59e0b'
                                : perm === 'write'
                                ? '#3b82f6'
                                : '#10b981'
                          }}
                        />
                      )) || <Typography variant="caption" sx={{ color: 'text.secondary' }}>none</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
                    {toolDef?.execution?.command || toolDef?.endpoint || 'static'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tools/${tool.toolId}`);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmEvent)}
        title="Accept this new configuration?"
        description="This will update the trusted baseline to include the reviewed capability and establish a new tamper-proof security hash."
        confirmText="Accept & Update Baseline"
        onConfirm={async () => {
          if (confirmEvent) {
            await acceptDriftEvent(confirmEvent.eventId, confirmEvent.toolId);
            setConfirmEvent(null);
          }
        }}
        onCancel={() => setConfirmEvent(null)}
      />
    </Box>
  );
};
