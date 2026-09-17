import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import { useDemoData } from '../context/DemoDataContext';
import { useThemeMode } from '../context/ThemeModeContext';

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',    icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Trust Drift',   path: '/drift',        icon: <WarningAmberIcon fontSize="small" />,    badgeKey: 'drift' },
  { label: 'Connect IDE',   path: '/integrations', icon: <HubOutlinedIcon fontSize="small" /> },
  { label: 'Settings',      path: '/settings',     icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export const AppShell: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { toggleTheme } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    driftEvents,
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    isJudgeDemoActive,
    loadJudgeDemo,
    exitJudgeDemo,
    switchWorkspace,
    importWorkspaceBaseline,
    exportActiveBaseline,
    disconnectProject,
  } = useDemoData();

  const [workspaceMenuAnchor, setWorkspaceMenuAnchor] = useState<null | HTMLElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importProjectName, setImportProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const openDriftCount = driftEvents.filter(e => e.status === 'open').length;

  const handleJudgeDemoClick = () => {
    loadJudgeDemo();
    navigate('/drift');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      try {
        const parsed = JSON.parse(content.replace(/^\uFEFF/, '').trim());
        if (parsed.projectId && !importProjectName) setImportProjectName(parsed.projectId);
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) { setImportError('Please paste or upload a baseline.json.'); return; }
    try {
      const parsed = JSON.parse(importJsonText.replace(/^\uFEFF/, '').trim());
      const success = importWorkspaceBaseline(parsed, importProjectName.trim() || undefined);
      if (success) {
        setImportDialogOpen(false);
        setImportJsonText('');
        setImportProjectName('');
        navigate('/dashboard');
      } else {
        setImportError('Unrecognized baseline format. Must contain a valid "tools" object.');
      }
    } catch {
      setImportError('Invalid JSON syntax.');
    }
  };

  // Ultra-premium palette
  const bg        = isDark ? '#080b11' : '#f8fafc';
  const surface   = isDark ? '#0f141f' : '#ffffff';
  const border    = isDark ? '#1e2638' : '#e2e8f0';
  const navHover  = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
  const navActive = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: surface, borderRight: `1px solid ${border}` }}>
      {/* Brand Header */}
      <Box
        sx={{
          px: 2.2,
          py: 1.8,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          borderBottom: `1px solid ${border}`,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '9px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.22)',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="ToolGuard Logo"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.currentTarget;
              if (!target.dataset.retried) {
                target.dataset.retried = 'true';
                target.src = '/logo.svg';
              }
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '-0.025em', color: 'text.primary', lineHeight: 1.1 }}>
            ToolGuard
          </Typography>
        </Box>
      </Box>

      {/* Navigation items */}
      <List sx={{ px: 1.25, py: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: '8px',
                  py: 0.8,
                  px: 1.25,
                  minHeight: 38,
                  color: isSelected ? '#047857' : 'text.secondary',
                  backgroundColor: isSelected ? navActive : 'transparent',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { backgroundColor: navHover, color: 'text.primary' },
                  '&.Mui-selected': { backgroundColor: navActive },
                  '&.Mui-selected:hover': { backgroundColor: navActive },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: isSelected ? '#059669' : 'inherit', '& svg': { fontSize: 18 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 500, color: 'inherit' }}
                />
                {item.badgeKey === 'drift' && openDriftCount > 0 && (
                  <Box sx={{ ml: 'auto', minWidth: 18, height: 18, borderRadius: '9px', backgroundColor: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 750, lineHeight: 1 }}>{openDriftCount}</Typography>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Live Security Engine Pill */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${border}` }}>
        <Box sx={{ p: 1.25, borderRadius: '8px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', animation: 'statusPulse 2s infinite' }} />
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 750, fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              SHA-256 ACTIVE
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
            Continuous baseline watch
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: bg }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: isDark ? 'rgba(15, 20, 31, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`,
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', px: { xs: 2, md: 2.5 }, minHeight: '52px !important' }}>
          {/* Left: Mobile Toggle & Workspace Pill */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: 'text.primary', mr: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}

            <Button
              size="small"
              onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
              sx={{
                py: 0.5, px: 1.5, borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                border: `1px solid ${border}`,
                boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.82rem',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc', borderColor: '#cbd5e1' },
              }}
            >
              <ShieldIcon sx={{ fontSize: 15, color: '#059669', mr: 0.75 }} />
              {activeWorkspace ? activeWorkspace.name : 'Connect Project'}
            </Button>
          </Box>

          {/* Right: Engine Indicator, Judge Demo & Theme Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.35,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', animation: 'statusPulse 2s infinite' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.04em' }}>
                ZERO-TRUST GUARD
              </Typography>
            </Box>

            <Button
              size="small"
              variant="contained"
              startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
              onClick={handleJudgeDemoClick}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.4,
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', boxShadow: 'none' },
              }}
            >
              ⚡ 1-Click Demo
            </Button>

            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                {isDark ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Workspace Selector Menu */}
      <Menu
        anchorEl={workspaceMenuAnchor}
        open={Boolean(workspaceMenuAnchor)}
        onClose={() => setWorkspaceMenuAnchor(null)}
        PaperProps={{
          sx: { backgroundColor: surface, border: `1px solid ${border}`, minWidth: 240, borderRadius: '8px', boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.12)', py: 0.5 }
        }}
      >
        {workspaces.length > 0 && (
          <Box sx={{ px: 1.5, pt: 0.75, pb: 0.25 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              PROJECT WORKSPACES
            </Typography>
          </Box>
        )}
        {workspaces.map((ws) => {
          const isCurrent = ws.id === activeWorkspaceId;
          return (
            <MenuItem
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuAnchor(null); }}
              sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, display: 'flex', justifyContent: 'space-between', gap: 1, backgroundColor: isCurrent ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)') : 'transparent' }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 400, color: 'text.primary', fontSize: '0.84rem' }}>
                  {ws.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>{ws.tools.length} tools monitored</Typography>
              </Box>
              {isCurrent && <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />}
            </MenuItem>
          );
        })}

        {workspaces.length > 0 && <Divider sx={{ my: 0.5, borderColor: border }} />}

        <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); setImportDialogOpen(true); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
          <FileUploadOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>Import baseline.json</Typography>
        </MenuItem>

        <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); navigate('/integrations'); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
          <AddCircleOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>Connect new project (CLI / IDE)</Typography>
        </MenuItem>

        {activeWorkspace && (
          <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); exportActiveBaseline(); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
            <FileDownloadOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>Export baseline.json</Typography>
          </MenuItem>
        )}

        {activeWorkspace && (
          <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); disconnectProject(); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
            <LinkOffIcon sx={{ fontSize: 16, color: '#f43f5e' }} />
            <Typography variant="body2" sx={{ color: '#f43f5e', fontSize: '0.84rem', fontWeight: 600 }}>Disconnect project</Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Import Baseline Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '10px' } }}
      >
        <DialogTitle sx={{ fontWeight: 750, fontSize: '1.05rem', pb: 0.5 }}>Import Project Baseline</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
            Run <code>toolguard init -y</code> then <code>toolguard export</code> in your project, then paste the output below.
          </Typography>
          {importError && <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>{importError}</Alert>}
          <TextField label="Project Name (optional)" placeholder="e.g. backend-api" value={importProjectName} onChange={(e) => setImportProjectName(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} />
          <Button variant="outlined" component="label" startIcon={<FileUploadOutlinedIcon />} size="small" sx={{ textTransform: 'none', mb: 1.5, borderRadius: '6px' }}>
            Upload baseline.json file
            <input type="file" accept=".json" hidden onChange={handleFileUpload} />
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>Or paste JSON directly:</Typography>
          <TextField multiline rows={7} fullWidth placeholder='{ "baselineId": "...", "tools": { ... } }' value={importJsonText} onChange={(e) => setImportJsonText(e.target.value)} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setImportDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleExecuteImport} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}>
            Import &amp; Protect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }} open>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: '48px', minHeight: 'calc(100vh - 48px)' }}>
        {isJudgeDemoActive && (
          <Alert
            severity="warning"
            icon={<BoltIcon sx={{ color: '#f59e0b', fontSize: 18 }} />}
            action={<Button color="inherit" size="small" onClick={exitJudgeDemo} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}>Exit Demo</Button>}
            sx={{ mb: 2.5, borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)', backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.10)', fontSize: '0.84rem' }}
          >
            <strong>⚡ Hackathon Judge Demo Active:</strong> Simulated capability expansion on <code>npm:dev</code> (unauthorized network egress &amp; debug privileges).
          </Alert>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};
