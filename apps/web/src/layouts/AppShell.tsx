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
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useDemoData } from '../context/DemoDataContext';
import { useThemeMode } from '../context/ThemeModeContext';

const DRAWER_WIDTH = 240;

const NAV_GROUPS = [
  {
    title: 'MONITORING',
    items: [
      { label: 'Overview', path: '/dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 18 }} /> },
      { label: 'Drift Incidents', path: '/drift', icon: <WarningAmberIcon sx={{ fontSize: 18 }} />, badgeKey: 'drift' },
    ]
  },
  {
    title: 'DEVELOPER',
    items: [
      { label: 'IDE & CLI', path: '/integrations', icon: <HubOutlinedIcon sx={{ fontSize: 18 }} /> },
      { label: 'Rules & Policies', path: '/settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 18 }} /> },
    ]
  },
  {
    title: 'NAVIGATION',
    items: [
      { label: 'Go to Main', path: '/', icon: <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} /> },
    ]
  }
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
        setImportError('Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) { setImportError('Please provide a baseline.json content.'); return; }
    try {
      const parsed = JSON.parse(importJsonText.replace(/^\uFEFF/, '').trim());
      const success = importWorkspaceBaseline(parsed, importProjectName.trim() || undefined);
      if (success) {
        setImportDialogOpen(false);
        setImportJsonText('');
        setImportProjectName('');
        navigate('/dashboard');
      } else {
        setImportError('Invalid baseline format. Must include a valid "tools" object.');
      }
    } catch {
      setImportError('Invalid JSON syntax.');
    }
  };

  const handleJudgeDemoClick = () => {
    loadJudgeDemo();
    navigate('/drift');
  };

  // ── Crisp, authentic developer tool styling tokens ────────────────────────
  const bgMain     = isDark ? '#0C0E14' : '#F8FAFC';
  const sidebarBg  = isDark ? '#10131B' : '#FFFFFF';
  const borderCol  = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
  const textMuted  = isDark ? '#8590A6' : '#64748B';
  const textHeader = isDark ? '#EDF2F7' : '#0F172A';
  const accent     = isDark ? '#00D4AA' : '#009E7E';
  const dangerCol  = isDark ? '#FF4D6A' : '#E11D48';

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${borderCol}`,
    }}>
      {/* Brand & Workspace Switcher Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${borderCol}` }}>
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', mb: 2 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '7px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: `1px solid ${borderCol}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Box component="img" src="/logo.png" alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: textHeader, letterSpacing: '-0.02em' }}>
            ToolGuard
          </Typography>
          <Chip
            label="CLI"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.62rem',
              fontWeight: 700,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              color: textMuted,
              borderRadius: '4px',
              ml: 'auto'
            }}
          />
        </Box>

        {/* Project Selector Trigger */}
        <Box
          onClick={(e) => setWorkspaceMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.25,
            py: 0.9,
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            border: `1px solid ${borderCol}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <FolderOutlinedIcon sx={{ fontSize: 16, color: textMuted }} />
            <Typography sx={{
              fontSize: '0.82rem',
              fontWeight: 650,
              color: textHeader,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activeWorkspace ? activeWorkspace.name : 'Select Project'}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: textMuted, flexShrink: 0 }} />
        </Box>
      </Box>

      {/* Navigation Links by Group */}
      <Box sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <Box key={group.title} sx={{ mb: gIdx < NAV_GROUPS.length - 1 ? 2.5 : 0 }}>
            <Typography sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: textMuted,
              letterSpacing: '0.06em',
              px: 1.25,
              mb: 1
            }}>
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isSelected = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                      sx={{
                        borderRadius: '7px',
                        py: 0.75,
                        px: 1.25,
                        minHeight: 36,
                        color: isSelected ? textHeader : textMuted,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9')
                          : 'transparent',
                        border: isSelected
                          ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`
                          : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                          color: textHeader
                        }
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 28,
                        color: isSelected ? (isDark ? accent : '#009E7E') : textMuted,
                        transition: 'color 0.15s'
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 650 : 500,
                          color: 'inherit',
                          letterSpacing: '-0.01em'
                        }}
                      />
                      {item.badgeKey === 'drift' && openDriftCount > 0 && (
                        <Box sx={{
                          ml: 'auto',
                          px: 0.75,
                          height: 18,
                          borderRadius: '9px',
                          backgroundColor: dangerCol,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography sx={{ fontSize: '0.64rem', color: '#fff', fontWeight: 750 }}>
                            {openDriftCount}
                          </Typography>
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Clean Environment Status Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${borderCol}` }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.25,
          py: 0.9,
          borderRadius: '7px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          border: `1px solid ${borderCol}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: openDriftCount > 0 ? dangerCol : accent
            }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: textHeader }}>
              {openDriftCount > 0 ? 'Drift detected' : 'Engine active'}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.68rem', fontFamily: '"JetBrains Mono", monospace', color: textMuted }}>
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: bgMain }}>
      {/* ── TOP BAR (Minimalist developer tool style) ─────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: isDark ? 'rgba(16, 19, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderCol}`,
          zIndex: 1100,
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '48px !important' }}>
          {/* Breadcrumb Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: textHeader, mr: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}

            <Typography sx={{ fontSize: '0.78rem', color: textMuted, fontWeight: 500 }}>
              Projects
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: textMuted }}>/</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: textHeader, fontWeight: 650 }}>
              {activeWorkspace?.name || 'Workspace'}
            </Typography>
          </Box>

          {/* Right Toolbar Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleJudgeDemoClick}
              startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.76rem',
                borderRadius: '6px',
                borderColor: borderCol,
                color: textHeader,
                py: 0.4,
                px: 1.25,
                '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }
              }}
            >
              Simulate Drift
            </Button>

            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                size="small"
                onClick={toggleTheme}
                sx={{
                  color: textMuted,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '6px',
                  p: 0.6,
                  '&:hover': { color: textHeader, borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }
                }}
              >
                {isDark ? <Brightness7Icon sx={{ fontSize: 16 }} /> : <Brightness4Icon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── WORKSPACE SELECTOR DROPDOWN MENU ─────────────────────────────────── */}
      <Menu
        anchorEl={workspaceMenuAnchor}
        open={Boolean(workspaceMenuAnchor)}
        onClose={() => setWorkspaceMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: sidebarBg,
            border: `1px solid ${borderCol}`,
            minWidth: 240,
            borderRadius: '10px',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(15,23,42,0.08)',
            py: 0.5
          }
        }}
      >
        <Box sx={{ px: 1.5, py: 0.75 }}>
          <Typography sx={{ color: textMuted, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            PROJECTS
          </Typography>
        </Box>
        {workspaces.map((ws) => {
          const isCurrent = ws.id === activeWorkspaceId;
          return (
            <MenuItem
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuAnchor(null); }}
              sx={{
                py: 0.8,
                px: 1.5,
                borderRadius: '6px',
                mx: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: isCurrent ? (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') : 'transparent'
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: isCurrent ? 650 : 450, color: textHeader, fontSize: '0.82rem' }}>
                  {ws.name}
                </Typography>
                <Typography sx={{ color: textMuted, fontSize: '0.7rem' }}>
                  {ws.tools.length} capabilities
                </Typography>
              </Box>
              {isCurrent && <CheckIcon sx={{ fontSize: 15, color: accent }} />}
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 0.5, borderColor: borderCol }} />

        <MenuItem
          onClick={() => { setWorkspaceMenuAnchor(null); setImportDialogOpen(true); }}
          sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1 }}
        >
          <FileUploadOutlinedIcon sx={{ fontSize: 16, color: textMuted }} />
          <Typography sx={{ color: textHeader, fontSize: '0.8rem' }}>Import baseline.json</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => { setWorkspaceMenuAnchor(null); navigate('/integrations'); }}
          sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1 }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 16, color: textMuted }} />
          <Typography sx={{ color: textHeader, fontSize: '0.8rem' }}>Add Project (IDE / CLI)</Typography>
        </MenuItem>

        {activeWorkspace && (
          <MenuItem
            onClick={() => { setWorkspaceMenuAnchor(null); exportActiveBaseline(); }}
            sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1 }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16, color: textMuted }} />
            <Typography sx={{ color: textMuted, fontSize: '0.8rem' }}>Export baseline.json</Typography>
          </MenuItem>
        )}

        {activeWorkspace && (
          <MenuItem
            onClick={() => { setWorkspaceMenuAnchor(null); disconnectProject(); }}
            sx={{ py: 0.75, px: 1.5, borderRadius: '6px', mx: 0.5, gap: 1, color: dangerCol }}
          >
            <LinkOffIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ color: dangerCol, fontSize: '0.8rem', fontWeight: 600 }}>Disconnect Project</Typography>
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
            backgroundColor: sidebarBg,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            p: 0.5
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 750, fontSize: '1rem', color: textHeader }}>
          Import Project Baseline
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: textMuted, fontSize: '0.82rem', mb: 2 }}>
            Run <code>toolguard export</code> inside your local repository, then paste or upload the generated JSON below.
          </Typography>
          {importError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '6px', fontSize: '0.82rem' }}>
              {importError}
            </Alert>
          )}
          <TextField
            label="Project Name (optional)"
            placeholder="e.g. backend-api"
            value={importProjectName}
            onChange={(e) => setImportProjectName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUploadOutlinedIcon />}
            size="small"
            sx={{ textTransform: 'none', mb: 2, borderRadius: '6px', borderColor: borderCol, color: textHeader }}
          >
            Select baseline.json
            <input type="file" accept=".json" hidden onChange={handleFileUpload} />
          </Button>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder='{ "baselineId": "...", "tools": { ... } }'
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.78rem',
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
                borderRadius: '6px'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setImportDialogOpen(false)} sx={{ textTransform: 'none', color: textMuted, fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteImport}
            sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '6px', fontSize: '0.82rem' }}
          >
            Import Baseline
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SIDEBAR DRAWER ───────────────────────────────────────────────────── */}
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

      {/* ── MAIN VIEW CONTENT ────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '48px',
          minHeight: 'calc(100vh - 48px)',
          backgroundColor: bgMain,
        }}
      >
        {isJudgeDemoActive && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={exitJudgeDemo} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                Exit Demo
              </Button>
            }
            sx={{
              mb: 3,
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'}`,
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
              fontSize: '0.84rem'
            }}
          >
            <strong>Simulation Active:</strong> Testing unauthorized capability drift on <code>npm:dev</code>.
          </Alert>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};
