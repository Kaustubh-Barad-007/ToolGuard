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
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useDemoData } from '../context/DemoDataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Workspace Tools', path: '/tools', icon: <BuildOutlinedIcon /> },
  { label: 'Trust Drift', path: '/drift', icon: <WarningAmberIcon />, badgeKey: 'drift' },
  { label: 'Connect Project', path: '/integrations', icon: <HubOutlinedIcon />, highlight: true },
  { label: 'Baselines', path: '/baselines', icon: <LayersOutlinedIcon /> },
  { label: 'Audit Timeline', path: '/timeline', icon: <HistoryOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
  { label: 'Documentation', path: '/docs', icon: <MenuBookOutlinedIcon /> }
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
    disconnectProject
  } = useDemoData();

  const { user, logout } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [workspaceMenuAnchor, setWorkspaceMenuAnchor] = useState<null | HTMLElement>(null);
  const [scanning, setScanning] = useState(false);

  // Import Dialog State
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importProjectName, setImportProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const openDriftCount = driftEvents.filter(e => e.status === 'open').length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleScanClick = async () => {
    setScanning(true);
    await triggerScan();
    setScanning(false);
  };

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
        if (parsed.projectId && !importProjectName) {
          setImportProjectName(parsed.projectId);
        }
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste or upload a baseline.json file.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const success = importWorkspaceBaseline(parsed, importProjectName.trim() || undefined);
      if (success) {
        setImportDialogOpen(false);
        setImportJsonText('');
        setImportProjectName('');
        navigate('/dashboard');
      } else {
        setImportError('Baseline format unrecognized. Ensure it contains a valid "tools" object.');
      }
    } catch {
      setImportError('Invalid JSON syntax. Please check the pasted content.');
    }
  };

  const drawerBg = isDark ? '#090d16' : '#ffffff';
  const appbarBg = isDark ? '#0c101a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: drawerBg }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${borderColor}`,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/dashboard')}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
          }}
        >
          <ShieldIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'text.primary' }}>
            ToolGuard
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 550 }}>
            Zero-Trust Capability Guard
          </Typography>
        </Box>
      </Box>

      {/* Active Workspace Switcher Pill */}
      <Box sx={{ p: 1.75, pb: 1, borderBottom: `1px solid ${borderColor}` }}>
        <Box
          onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${borderColor}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: 'primary.main'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650, fontSize: '0.68rem', textTransform: 'uppercase' }}>
              Active Workspace
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }} noWrap>
            {activeWorkspace ? activeWorkspace.name : 'No Project Connected'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Chip
              label={activeWorkspace ? activeWorkspace.stack : 'Disconnected'}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                fontWeight: 700,
                backgroundColor: activeWorkspace ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)') : 'rgba(239, 68, 68, 0.1)',
                color: activeWorkspace ? '#3b82f6' : '#ef4444'
              }}
            />
            {activeWorkspace && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                {activeWorkspace.tools.length} tools
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.25, py: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  py: 0.85,
                  px: 1.5,
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  backgroundColor: isSelected
                    ? isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isSelected ? 'primary.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: isSelected ? 650 : 500 }}
                />
                {item.badgeKey === 'drift' && openDriftCount > 0 && (
                  <Chip
                    label={openDriftCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.68rem',
                      fontWeight: 750,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444'
                    }}
                  />
                )}
                {item.highlight && (
                  <Chip
                    label="ANY IDE"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 750,
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Security Engine Status Indicator */}
      <Box sx={{ p: 2, borderTop: `1px solid ${borderColor}` }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon sx={{ color: '#10b981', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 750 }}>
                SECURITY ENGINE
              </Typography>
            </Box>
            <Chip label="ACTIVE" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }} />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block' }}>
            Cryptographic baseline active. Monitoring trust drift across workspace.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#080b11' : '#f8fafc' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: appbarBg,
          borderBottom: `1px solid ${borderColor}`,
          boxShadow: 'none',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          {/* Left: Workspace Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Workspace Selector Button */}
            <Button
              size="small"
              onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
              sx={{
                py: 0.5,
                px: 1.25,
                borderRadius: 1.5,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${borderColor}`,
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.86rem',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
                }
              }}
            >
              <ShieldIcon sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
              {activeWorkspace ? activeWorkspace.name : 'Connect Project'}
            </Button>

            {activeWorkspace && (
              <Chip
                label={activeWorkspace.stack}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.64rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6',
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              />
            )}
          </Box>

          {/* Right Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* ⚡ HACKATHON JUDGE DEMO BUTTON */}
            <Button
              variant="contained"
              size="small"
              startIcon={<BoltIcon sx={{ color: '#fff' }} />}
              onClick={handleJudgeDemoClick}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 750,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.75,
                py: 0.6,
                borderRadius: 1.5,
                boxShadow: '0 3px 12px rgba(245, 158, 11, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.5)'
                }
              }}
            >
              ⚡ Try Demo (1-Click)
            </Button>

            {/* Theme Toggle (Dark / Light Mode) */}
            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.primary' }}>
                {isDark ? <Brightness7Icon sx={{ fontSize: 20 }} /> : <Brightness4Icon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {/* Account Profile Menu */}
            <Tooltip title="Account & Preferences">
              <IconButton size="small" onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
                <AccountCircleOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Workspace Switcher Menu */}
      <Menu
        anchorEl={workspaceMenuAnchor}
        open={Boolean(workspaceMenuAnchor)}
        onClose={() => setWorkspaceMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#111624' : '#ffffff',
            border: `1px solid ${borderColor}`,
            minWidth: 260,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            py: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em' }}>
            PROJECT WORKSPACES
          </Typography>
        </Box>

        {workspaces.map((ws) => {
          const isCurrent = ws.id === activeWorkspaceId;
          return (
            <MenuItem
              key={ws.id}
              onClick={() => {
                switchWorkspace(ws.id);
                setWorkspaceMenuAnchor(null);
              }}
              sx={{
                py: 1,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isCurrent ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)') : 'transparent'
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: isCurrent ? 750 : 500, color: 'text.primary' }}>
                    {ws.name}
                  </Typography>
                  <Chip
                    label={ws.stack}
                    size="small"
                    sx={{ height: 16, fontSize: '0.6rem', fontWeight: 650 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                  {ws.tools.length} tools monitored
                </Typography>
              </Box>
              {isCurrent && <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />}
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 1, borderColor: borderColor }} />

        <MenuItem
          onClick={() => {
            setWorkspaceMenuAnchor(null);
            setImportDialogOpen(true);
          }}
          sx={{ py: 1, px: 2, gap: 1.5 }}
        >
          <FileUploadOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Import baseline.json file...
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setWorkspaceMenuAnchor(null);
            navigate('/integrations');
          }}
          sx={{ py: 1, px: 2, gap: 1.5 }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Connect New Project (CLI / IDE)...
          </Typography>
        </MenuItem>

        {activeWorkspace && (
          <MenuItem
            onClick={() => {
              setWorkspaceMenuAnchor(null);
              exportActiveBaseline();
            }}
            sx={{ py: 1, px: 2, gap: 1.5 }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Export Baseline (.json)
            </Typography>
          </MenuItem>
        )}

        {activeWorkspace && (
          <MenuItem
            onClick={() => {
              setWorkspaceMenuAnchor(null);
              disconnectProject();
            }}
            sx={{ py: 1, px: 2, gap: 1.5 }}
          >
            <CloseIcon sx={{ fontSize: 18, color: '#ef4444' }} />
            <Typography variant="body2" sx={{ color: '#ef4444' }}>
              Disconnect Active Project
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Account Profile Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#111624' : '#ffffff',
            border: `1px solid ${borderColor}`,
            minWidth: 190,
            borderRadius: 1.5
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Active User</Typography>
          <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary' }}>
            {user?.email || 'developer@toolguard.local'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: borderColor }} />
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/integrations'); }}>Connect Project</MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); handleJudgeDemoClick(); }}>⚡ Judge Demo Tour</MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); toggleTheme(); }}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/settings'); }}>Settings</MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); logout(); }}>Sign Out</MenuItem>
      </Menu>

      {/* Import Project Baseline Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#0e1320' : '#ffffff',
            border: `1px solid ${borderColor}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 750, pb: 1 }}>
          Import Project Baseline
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Connect and inspect <strong>any project</strong> on ToolGuard. Upload your <code>.toolguard/baseline.json</code> or paste the output from <code>toolguard export</code>.
          </Typography>

          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Project Name (Optional)"
              placeholder="e.g. MaxxTone, My-Backend, Client-Repo"
              value={importProjectName}
              onChange={(e) => setImportProjectName(e.target.value)}
              fullWidth
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUploadOutlinedIcon />}
              sx={{ textTransform: 'none', mb: 1.5 }}
            >
              Upload baseline.json file
              <input type="file" accept=".json" hidden onChange={handleFileUpload} />
            </Button>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
              Or paste baseline JSON directly:
            </Typography>
            <TextField
              multiline
              rows={8}
              fullWidth
              placeholder='{ "baselineId": "...", "tools": { ... } }'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            />
          </Box>

          <Alert severity="info" sx={{ fontSize: '0.78rem' }}>
            Tip: In your project terminal, run <code>toolguard init -y</code> then <code>toolguard export</code> to copy your baseline JSON.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setImportDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteImport}
            sx={{ textTransform: 'none', fontWeight: 650 }}
          >
            Import & Protect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: `1px solid ${borderColor}`
              }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {/* Hackathon Judge Demo Banner */}
        {isJudgeDemoActive && (
          <Alert
            severity="warning"
            icon={<BoltIcon sx={{ color: '#f59e0b' }} />}
            action={
              <Button color="inherit" size="small" onClick={exitJudgeDemo} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Exit Judge Demo
              </Button>
            }
            sx={{
              mb: 3,
              borderRadius: 2,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.12)'
            }}
          >
            <strong>⚡ Hackathon Judge Demo Active:</strong> A critical capability expansion has been simulated on <code>npm:dev</code> (unauthorized network egress & debug privileges). Review the diff and accept or block below.
          </Alert>
        )}

        <Outlet />
      </Box>
    </Box>
  );
};
