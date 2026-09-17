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

const DRAWER_WIDTH = 236;

const NAV_ITEMS = [
  { label: 'Security Console', path: '/dashboard',    icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
  { label: 'Trust Drift Log',  path: '/drift',        icon: <WarningAmberIcon sx={{ fontSize: 19 }} />, badgeKey: 'drift' },
  { label: 'Integrations & IDE', path: '/integrations', icon: <HubOutlinedIcon sx={{ fontSize: 19 }} /> },
  { label: 'Security Policy',   path: '/settings',     icon: <SettingsOutlinedIcon sx={{ fontSize: 19 }} /> },
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
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) { setImportError('Please paste or upload a valid baseline.json.'); return; }
    try {
      const parsed = JSON.parse(importJsonText.replace(/^\uFEFF/, '').trim());
      const success = importWorkspaceBaseline(parsed, importProjectName.trim() || undefined);
      if (success) {
        setImportDialogOpen(false);
        setImportJsonText('');
        setImportProjectName('');
        navigate('/dashboard');
      } else {
        setImportError('Unrecognized baseline structure. Must contain a valid "tools" object.');
      }
    } catch {
      setImportError('Invalid JSON syntax.');
    }
  };

  // ── Obsidian Vault Color Palette ──────────────────────────────────────
  const bgCanvas      = isDark ? '#06090F' : '#FAFBFE';
  const surfaceDrawer = isDark ? '#0A0E1A' : '#FFFFFF';
  const borderSubtle  = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(210, 218, 235, 0.85)';
  const accentPrimary = isDark ? '#00D4AA' : '#008B72';
  const accentViolet  = isDark ? '#7C5CFC' : '#5B3FD4';
  const dangerColor   = isDark ? '#FF4D6A' : '#D63051';
  const textMuted     = isDark ? '#6B7A99' : '#5A6578';

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: surfaceDrawer,
      borderRight: `1px solid ${borderSubtle}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Brand Header */}
      <Box
        sx={{
          px: 2.25,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${borderSubtle}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover .brand-logo': {
            transform: 'scale(1.06) rotate(-2deg)',
          }
        }}
        onClick={() => navigate('/')}
      >
        <Box
          className="brand-logo"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(210, 218, 235, 0.8)'}`,
            boxShadow: `0 3px 12px ${isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 139, 114, 0.15)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0
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
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontWeight: 850, fontSize: '1.05rem', letterSpacing: '-0.03em', color: 'text.primary', lineHeight: 1.1 }}>
              ToolGuard
            </Typography>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentPrimary, animation: 'radarPing 2s infinite' }} />
          </Box>
          <Typography sx={{ fontSize: '0.67rem', color: textMuted, fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase', mt: 0.25 }}>
            Zero-Trust Console
          </Typography>
        </Box>
      </Box>

      {/* Navigation items */}
      <List sx={{ px: 1.25, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  minHeight: 42,
                  position: 'relative',
                  overflow: 'hidden',
                  color: isSelected ? (isDark ? '#00D4AA' : '#008B72') : textMuted,
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(0, 212, 170, 0.08)' : 'rgba(0, 139, 114, 0.07)')
                    : 'transparent',
                  border: isSelected
                    ? `1px solid ${isDark ? 'rgba(0, 212, 170, 0.28)' : 'rgba(0, 139, 114, 0.25)'}`
                    : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F0F3F9',
                    color: 'text.primary',
                    transform: 'translateX(2px)'
                  },
                  '&::before': isSelected ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: '3px',
                    borderRadius: '0 2px 2px 0',
                    backgroundColor: accentPrimary,
                    boxShadow: `0 0 10px ${accentPrimary}`,
                  } : {},
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 32,
                  color: isSelected ? accentPrimary : 'inherit',
                  transition: 'color 0.2s',
                  '& svg': {
                    filter: isSelected ? `drop-shadow(0 0 6px ${accentPrimary}40)` : 'none'
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 750 : 550,
                    color: 'inherit',
                    letterSpacing: '-0.01em'
                  }}
                />
                {item.badgeKey === 'drift' && openDriftCount > 0 && (
                  <Box sx={{
                    ml: 'auto',
                    minWidth: 20,
                    height: 20,
                    borderRadius: '10px',
                    backgroundColor: dangerColor,
                    boxShadow: `0 0 10px ${dangerColor}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.6,
                    animation: 'radarPing 2s infinite'
                  }}>
                    <Typography sx={{ fontSize: '0.67rem', color: '#fff', fontWeight: 850, lineHeight: 1 }}>
                      {openDriftCount}
                    </Typography>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Live Security Engine Radar Widget */}
      <Box sx={{ p: 1.75, borderTop: `1px solid ${borderSubtle}` }}>
        <Box sx={{
          p: 1.5,
          borderRadius: '12px',
          backgroundColor: isDark ? 'rgba(0, 212, 170, 0.05)' : 'rgba(0, 139, 114, 0.05)',
          border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.22)' : 'rgba(0, 139, 114, 0.2)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: accentPrimary,
                boxShadow: `0 0 8px ${accentPrimary}`,
                animation: 'radarPing 1.8s infinite'
              }} />
              <Typography variant="caption" sx={{ color: accentPrimary, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                SENTINEL V1 ACTIVE
              </Typography>
            </Box>
            <Chip
              label="SHA-256"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 750,
                backgroundColor: isDark ? 'rgba(0, 212, 170, 0.12)' : 'rgba(0, 139, 114, 0.1)',
                color: accentPrimary,
                border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 139, 114, 0.2)'}`
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.71rem', display: 'block', lineHeight: 1.4 }}>
            Continuous local verification monitoring active tool manifests.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: bgCanvas }}>
      {/* ── TOP APPBAR ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: isDark ? 'rgba(6, 9, 15, 0.85)' : 'rgba(250, 251, 254, 0.88)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          borderBottom: `1px solid ${borderSubtle}`,
          zIndex: 1100,
          transition: 'all 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: '1px',
            background: isDark
              ? `linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), rgba(124, 92, 252, 0.2), transparent)`
              : `linear-gradient(90deg, transparent, rgba(0, 139, 114, 0.2), rgba(91, 63, 212, 0.15), transparent)`,
          }
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '56px !important' }}>
          {/* Left: Mobile Toggle & Workspace Pill Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: 'text.primary', mr: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}

            <Button
              size="small"
              onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, color: textMuted }} />}
              sx={{
                py: 0.65,
                px: 1.6,
                borderRadius: '9px',
                backgroundColor: isDark ? '#0D1220' : '#ffffff',
                border: `1px solid ${borderSubtle}`,
                boxShadow: isDark ? 'none' : '0 2px 6px rgba(13, 17, 23, 0.04)',
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F7F8FC',
                  borderColor: accentPrimary,
                },
              }}
            >
              <ShieldIcon sx={{ fontSize: 16, color: accentPrimary, mr: 1 }} />
              {activeWorkspace ? activeWorkspace.name : 'Connect Project'}
              {activeWorkspace && (
                <Chip
                  label={activeWorkspace.stack}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 750,
                    ml: 1,
                    backgroundColor: isDark ? 'rgba(124, 92, 252, 0.15)' : 'rgba(91, 63, 212, 0.1)',
                    color: accentViolet,
                    borderRadius: '5px',
                  }}
                />
              )}
            </Button>
          </Box>

          {/* Right: Engine Indicator, 1-Click Demo & Theme Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Status Beacon */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.8,
                px: 1.4,
                py: 0.5,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(0, 212, 170, 0.08)' : 'rgba(0, 139, 114, 0.08)',
                border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.28)' : 'rgba(0, 139, 114, 0.25)'}`,
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: accentPrimary, animation: 'radarPing 2s infinite' }} />
              <Typography sx={{ fontSize: '0.71rem', fontWeight: 800, color: accentPrimary, letterSpacing: '0.04em' }}>
                ZERO-TRUST GUARD ACTIVE
              </Typography>
            </Box>

            {/* 1-Click Evaluation Demo */}
            <Button
              size="small"
              variant="contained"
              startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleJudgeDemoClick}
              sx={{
                background: 'linear-gradient(135deg, #FFB340 0%, #D97706 100%)',
                color: '#fff',
                fontWeight: 750,
                fontSize: '0.79rem',
                textTransform: 'none',
                px: 1.8,
                py: 0.6,
                borderRadius: '8px',
                boxShadow: '0 3px 12px rgba(217, 119, 6, 0.35)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 16px rgba(217, 119, 6, 0.45)',
                },
              }}
            >
              ⚡ 1-Click Demo
            </Button>

            {/* Light / Dark Mode Toggle */}
            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                size="small"
                onClick={toggleTheme}
                sx={{
                  color: 'text.secondary',
                  border: `1px solid ${borderSubtle}`,
                  borderRadius: '9px',
                  p: 0.75,
                  transition: 'all 0.25s',
                  '&:hover': {
                    color: 'text.primary',
                    borderColor: accentPrimary,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F2F8',
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                {isDark ? <Brightness7Icon sx={{ fontSize: 17 }} /> : <Brightness4Icon sx={{ fontSize: 17 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── WORKSPACE SELECTOR MENU ───────────────────────────────────────────── */}
      <Menu
        anchorEl={workspaceMenuAnchor}
        open={Boolean(workspaceMenuAnchor)}
        onClose={() => setWorkspaceMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#0D1220' : '#ffffff',
            border: `1px solid ${borderSubtle}`,
            minWidth: 260,
            borderRadius: '12px',
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.65)' : '0 12px 32px rgba(13,17,23,0.12)',
            py: 0.75
          }
        }}
      >
        {workspaces.length > 0 && (
          <Box sx={{ px: 1.75, pt: 0.8, pb: 0.4 }}>
            <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, fontSize: '0.67rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Connected Workspaces
            </Typography>
          </Box>
        )}
        {workspaces.map((ws) => {
          const isCurrent = ws.id === activeWorkspaceId;
          return (
            <MenuItem
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuAnchor(null); }}
              sx={{
                py: 0.9,
                px: 1.75,
                borderRadius: '8px',
                mx: 0.75,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1.5,
                backgroundColor: isCurrent ? (isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)') : 'transparent',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F3F9' }
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: isCurrent ? 750 : 500, color: 'text.primary', fontSize: '0.86rem' }}>
                  {ws.name}
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.72rem' }}>
                  {ws.tools.length} tool capabilities frozen
                </Typography>
              </Box>
              {isCurrent && <CheckIcon sx={{ fontSize: 17, color: accentPrimary }} />}
            </MenuItem>
          );
        })}

        {workspaces.length > 0 && <Divider sx={{ my: 0.75, borderColor: borderSubtle }} />}

        <MenuItem
          onClick={() => { setWorkspaceMenuAnchor(null); setImportDialogOpen(true); }}
          sx={{ py: 0.85, px: 1.75, borderRadius: '8px', mx: 0.75, gap: 1.25, '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F3F9' } }}
        >
          <FileUploadOutlinedIcon sx={{ fontSize: 17, color: accentPrimary }} />
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 600 }}>
            Import baseline.json
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => { setWorkspaceMenuAnchor(null); navigate('/integrations'); }}
          sx={{ py: 0.85, px: 1.75, borderRadius: '8px', mx: 0.75, gap: 1.25, '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F3F9' } }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 17, color: accentViolet }} />
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 600 }}>
            Connect New Project (IDE / CLI)
          </Typography>
        </MenuItem>

        {activeWorkspace && (
          <MenuItem
            onClick={() => { setWorkspaceMenuAnchor(null); exportActiveBaseline(); }}
            sx={{ py: 0.85, px: 1.75, borderRadius: '8px', mx: 0.75, gap: 1.25, '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F3F9' } }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 17, color: textMuted }} />
            <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
              Export baseline.json
            </Typography>
          </MenuItem>
        )}

        {activeWorkspace && (
          <MenuItem
            onClick={() => { setWorkspaceMenuAnchor(null); disconnectProject(); }}
            sx={{ py: 0.85, px: 1.75, borderRadius: '8px', mx: 0.75, gap: 1.25, '&:hover': { backgroundColor: `${dangerColor}12` } }}
          >
            <LinkOffIcon sx={{ fontSize: 17, color: dangerColor }} />
            <Typography variant="body2" sx={{ color: dangerColor, fontSize: '0.85rem', fontWeight: 700 }}>
              Disconnect Project
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* ── IMPORT BASELINE DIALOG ────────────────────────────────────────────── */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#0D1220' : '#ffffff',
            border: `1px solid ${borderSubtle}`,
            borderRadius: '16px',
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.7)' : '0 16px 40px rgba(13,17,23,0.14)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', pb: 0.5, letterSpacing: '-0.02em' }}>
          Import Cryptographic Project Baseline
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" sx={{ color: textMuted, mb: 2.5, lineHeight: 1.6 }}>
            Run <code>toolguard init -y</code> then <code>toolguard export</code> inside your local repository, then paste or upload the generated JSON.
          </Typography>
          {importError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontWeight: 600 }}>
              {importError}
            </Alert>
          )}
          <TextField
            label="Project Name (optional)"
            placeholder="e.g. core-auth-service"
            value={importProjectName}
            onChange={(e) => setImportProjectName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2.5 }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUploadOutlinedIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              mb: 2,
              borderRadius: '8px',
              borderColor: borderSubtle,
              fontWeight: 700
            }}
          >
            Select baseline.json File
            <input type="file" accept=".json" hidden onChange={handleFileUpload} />
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: textMuted, mb: 1, fontWeight: 700 }}>
            Or paste raw baseline JSON contents:
          </Typography>
          <TextField
            multiline
            rows={7}
            fullWidth
            placeholder='{ "baselineId": "...", "tools": { ... } }'
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.78rem',
                backgroundColor: isDark ? '#080B14' : '#F7F8FC',
                borderRadius: '8px',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setImportDialogOpen(false)} sx={{ textTransform: 'none', color: textMuted, fontWeight: 650 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteImport}
            sx={{
              textTransform: 'none',
              fontWeight: 750,
              borderRadius: '8px',
              px: 2.5,
              py: 0.8
            }}
          >
            Import &amp; Protect Workspace
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SIDEBAR DRAWER NAVIGATION ─────────────────────────────────────────── */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* ── MAIN CONTENT OUTLET ────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '56px',
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: bgCanvas,
        }}
      >
        {isJudgeDemoActive && (
          <Alert
            severity="warning"
            icon={<BoltIcon sx={{ color: '#FFB340', fontSize: 19 }} />}
            action={
              <Button color="inherit" size="small" onClick={exitJudgeDemo} sx={{ textTransform: 'none', fontWeight: 750, fontSize: '0.8rem' }}>
                Exit Demo
              </Button>
            }
            sx={{
              mb: 3,
              borderRadius: '10px',
              border: '1px solid rgba(255, 179, 64, 0.4)',
              backgroundColor: isDark ? 'rgba(255, 179, 64, 0.08)' : 'rgba(255, 179, 64, 0.12)',
              fontSize: '0.86rem',
              fontWeight: 550,
            }}
          >
            <strong>⚡ Interactive Threat Simulation Active:</strong> Simulated capability expansion on <code>npm:dev</code> (unauthorized network egress [0.0.0.0:443] and debug exec privileges).
          </Alert>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};
