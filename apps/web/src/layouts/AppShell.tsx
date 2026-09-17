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
    triggerScan,
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
        const parsed = JSON.parse(content);
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
      const parsed = JSON.parse(importJsonText);
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

  // GitHub-style colors
  const bg       = isDark ? '#0d1117' : '#f6f8fa';
  const surface  = isDark ? '#161b22' : '#ffffff';
  const border   = isDark ? '#30363d' : '#d0d7de';
  const navHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const navActive= isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.09)';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: surface, borderRight: `1px solid ${border}` }}>
      {/* Brand */}
      <Box
        sx={{ px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.25, borderBottom: `1px solid ${border}`, cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        <Box sx={{ width: 28, height: 28, borderRadius: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldIcon sx={{ color: '#fff', fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
          ToolGuard
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1, py: 1.25, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: '6px',
                  py: 0.75,
                  px: 1.25,
                  minHeight: 34,
                  color: isSelected ? '#10b981' : 'text.secondary',
                  backgroundColor: isSelected ? navActive : 'transparent',
                  '&:hover': { backgroundColor: navHover, color: 'text.primary' },
                  '&.Mui-selected': { backgroundColor: navActive },
                  '&.Mui-selected:hover': { backgroundColor: navActive },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: 'inherit', '& svg': { fontSize: 17 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: isSelected ? 600 : 400, color: 'inherit' }}
                />
                {item.badgeKey === 'drift' && openDriftCount > 0 && (
                  <Box sx={{ ml: 'auto', minWidth: 18, height: 18, borderRadius: '9px', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>{openDriftCount}</Typography>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Version footer */}
      <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${border}` }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
          v1.0.0 · toolguard-app.vercel.app
        </Typography>
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
          backgroundColor: surface,
          borderBottom: `1px solid ${border}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', px: { xs: 2, md: 2.5 }, minHeight: '48px !important' }}>
          {/* Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: 'text.primary', mr: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            {/* Workspace selector */}
            <Button
              size="small"
              onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
              sx={{
                py: 0.4, px: 1.25, borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${border}`,
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.82rem',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'text.primary' },
              }}
            >
              <ShieldIcon sx={{ fontSize: 14, color: '#10b981', mr: 0.75 }} />
              {activeWorkspace ? activeWorkspace.name : 'Connect Project'}
            </Button>
          </Box>

          {/* Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
              onClick={handleJudgeDemoClick}
              sx={{
                background: '#f59e0b',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.4,
                borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { background: '#d97706', boxShadow: 'none' },
              }}
            >
              Demo
            </Button>
            <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
              <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                {isDark ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Workspace Menu */}
      <Menu
        anchorEl={workspaceMenuAnchor}
        open={Boolean(workspaceMenuAnchor)}
        onClose={() => setWorkspaceMenuAnchor(null)}
        PaperProps={{
          sx: { backgroundColor: surface, border: `1px solid ${border}`, minWidth: 240, borderRadius: '8px', boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)', py: 0.5 }
        }}
      >
        {workspaces.length > 0 && (
          <Box sx={{ px: 1.5, pt: 0.75, pb: 0.25 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              WORKSPACES
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
                <Typography variant="body2" sx={{ fontWeight: isCurrent ? 600 : 400, color: 'text.primary', fontSize: '0.84rem' }}>
                  {ws.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>{ws.tools.length} tools</Typography>
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
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>Connect new project</Typography>
        </MenuItem>

        {activeWorkspace && (
          <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); exportActiveBaseline(); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
            <FileDownloadOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>Export baseline.json</Typography>
          </MenuItem>
        )}

        {activeWorkspace && (
          <MenuItem onClick={() => { setWorkspaceMenuAnchor(null); disconnectProject(); }} sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1.25 }}>
            <LinkOffIcon sx={{ fontSize: 16, color: '#ef4444' }} />
            <Typography variant="body2" sx={{ color: '#ef4444', fontSize: '0.84rem' }}>Disconnect project</Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>Import Project Baseline</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
            Run <code>toolguard init -y</code> then <code>toolguard export</code> in your project, then paste the output below.
          </Typography>
          {importError && <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>{importError}</Alert>}
          <TextField label="Project Name (optional)" placeholder="e.g. my-backend" value={importProjectName} onChange={(e) => setImportProjectName(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} />
          <Button variant="outlined" component="label" startIcon={<FileUploadOutlinedIcon />} size="small" sx={{ textTransform: 'none', mb: 1.5, borderRadius: '6px' }}>
            Upload baseline.json
            <input type="file" accept=".json" hidden onChange={handleFileUpload} />
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>Or paste JSON directly:</Typography>
          <TextField multiline rows={7} fullWidth placeholder='{ "baselineId": "...", "tools": { ... } }' value={importJsonText} onChange={(e) => setImportJsonText(e.target.value)} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setImportDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleExecuteImport} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}>
            Import & Protect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar Drawer */}
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: '48px', minHeight: 'calc(100vh - 48px)' }}>
        {isJudgeDemoActive && (
          <Alert
            severity="warning"
            icon={<BoltIcon sx={{ color: '#f59e0b', fontSize: 18 }} />}
            action={<Button color="inherit" size="small" onClick={exitJudgeDemo} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}>Exit</Button>}
            sx={{ mb: 2.5, borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)', backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.10)', fontSize: '0.84rem' }}
          >
            <strong>Judge Demo active</strong> — unauthorized capability expansion simulated on <code>npm:dev</code>.
          </Alert>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};
