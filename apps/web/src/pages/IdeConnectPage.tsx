import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Tabs,
  Tab,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { useDemoData } from '../context/DemoDataContext';

const VSIX_URL  = 'https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix';
const TGZ_URL   = 'https://toolguard-app.vercel.app/toolguard.tgz';

const CLI_STEPS = [
  { label: 'Step 1 — Global Installation', cmd: `npm install -g ${TGZ_URL}`, note: 'Bundles all dependencies. Works on Windows, macOS, and Linux.' },
  { label: 'Step 2 — Initialize Baseline', cmd: 'toolguard init -y', note: 'Runs in your project folder to discover and freeze tools into SHA-256 hashes.' },
  { label: 'Step 3 — Run Verification', cmd: 'toolguard scan', note: 'Verifies active capabilities against your local cryptographic baseline.' },
  { label: 'Step 4 — Reset / Disconnect', cmd: 'toolguard disconnect', note: 'Purges .toolguard/ directory and unlinks the local project.' },
];

const IDE_TABS = [
  { label: 'VS Code', cmd: `curl.exe -LO ${VSIX_URL}; code --install-extension toolguard-vscode-1.0.0.vsix`, note: 'Windows PowerShell' },
  { label: 'Cursor AI', cmd: `curl.exe -LO ${VSIX_URL}; cursor --install-extension toolguard-vscode-1.0.0.vsix`, note: 'Windows PowerShell' },
  { label: 'Windsurf', cmd: `curl.exe -LO ${VSIX_URL}; windsurf --install-extension toolguard-vscode-1.0.0.vsix`, note: 'Windows PowerShell' },
  { label: 'Mac / Linux', cmd: `curl -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`, note: 'Bash / Zsh' },
];

export const IdeConnectPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { importWorkspaceBaseline, loadJudgeDemo } = useDemoData();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeIdeTab, setActiveIdeTab] = useState(0);
  const [jsonText, setJsonText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const border        = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(210, 218, 235, 0.85)';
  const surface       = isDark ? '#0D1220' : '#ffffff';
  const surfaceMuted  = isDark ? '#080B14' : '#F7F8FC';
  const accentPrimary = isDark ? '#00D4AA' : '#008B72';
  const accentViolet  = isDark ? '#7C5CFC' : '#5B3FD4';
  const warningColor  = isDark ? '#FFB340' : '#CC8A1E';
  const textMuted     = isDark ? '#6B7A99' : '#5A6578';

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Tooltip title={copiedKey === id ? 'Copied to clipboard!' : 'Copy command'}>
      <IconButton
        size="small"
        onClick={() => copy(text, id)}
        sx={{
          ml: 1,
          color: copiedKey === id ? accentPrimary : textMuted,
          transition: 'all 0.2s',
          '&:hover': { color: 'text.primary', transform: 'scale(1.1)' }
        }}
      >
        {copiedKey === id ? <CheckIcon sx={{ fontSize: 16, color: accentPrimary }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
      </IconButton>
    </Tooltip>
  );

  const CodeBlock = ({ text, id }: { text: string; id: string }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: surfaceMuted,
      border: `1px solid ${border}`,
      borderRadius: '10px',
      px: 1.75,
      py: 1.1,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.82rem',
      color: isDark ? '#7C5CFC' : '#5B3FD4'
    }}>
      <code style={{ flex: 1, wordBreak: 'break-all', fontFamily: 'inherit', fontWeight: 650 }}>{text}</code>
      <CopyBtn text={text} id={id} />
    </Box>
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonText(content);
      try {
        const parsed = JSON.parse(content.replace(/^\uFEFF/, '').trim());
        if (parsed.projectId && !projectName) setProjectName(parsed.projectId);
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setImportError(null);
    if (!jsonText.trim()) { setImportError('Paste or upload a valid baseline.json.'); return; }
    try {
      const parsed = JSON.parse(jsonText.replace(/^\uFEFF/, '').trim());
      const ok = importWorkspaceBaseline(parsed, projectName.trim() || undefined);
      if (ok) {
        setImportSuccess(true);
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setImportError('Invalid baseline format. Must contain a valid "tools" object.');
      }
    } catch {
      setImportError('Invalid JSON syntax.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
            <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.03em' }}>
              Connect Any IDE or Command Line
            </Typography>
            <Chip
              label="UNIVERSAL ZERO-TRUST"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.67rem',
                fontWeight: 800,
                backgroundColor: `${accentPrimary}15`,
                color: accentPrimary,
                border: `1px solid ${accentPrimary}35`,
                borderRadius: '7px'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: textMuted, fontWeight: 500 }}>
            Zero-friction local setup · Native integration across VS Code, Cursor AI, Windsurf Editor, JetBrains, and terminal CLI.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />}
          onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
          sx={{
            textTransform: 'none',
            fontWeight: 750,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #FFB340 0%, #D97706 100%)',
            boxShadow: '0 3px 12px rgba(217, 119, 6, 0.35)',
            color: '#fff',
            px: 2,
            py: 0.75,
            '&:hover': {
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 16px rgba(217, 119, 6, 0.45)',
            }
          }}
        >
          ⚡ Launch Demo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── CARD 1: UNIVERSAL CLI ──────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: '16px',
              backgroundColor: surface,
              borderColor: border,
              boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{
                width: 42,
                height: 42,
                borderRadius: '11px',
                backgroundColor: `${accentPrimary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${accentPrimary}20`
              }}>
                <TerminalIcon sx={{ fontSize: 22, color: accentPrimary }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.02em' }}>
                  1. Universal CLI — Terminal, Makefiles, CI/CD, JetBrains &amp; Neovim
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Standalone binary with all dependencies bundled · Windows, macOS, and Linux
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {CLI_STEPS.map((step, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, display: 'block', mb: 0.75, letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                    {step.label.toUpperCase()}
                  </Typography>
                  <CodeBlock text={step.cmd} id={`cli-${i}`} />
                  <Typography variant="caption" sx={{ color: textMuted, display: 'block', mt: 0.75, fontSize: '0.75rem' }}>
                    {step.note}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* ── CARD 2: IDE EXTENSION ─────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: '16px',
              backgroundColor: surface,
              borderColor: border,
              boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{
                width: 42,
                height: 42,
                borderRadius: '11px',
                backgroundColor: `${accentViolet}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${accentViolet}20`
              }}>
                <CodeIcon sx={{ fontSize: 22, color: accentViolet }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.02em' }}>
                  2. VS Code, Cursor AI &amp; Windsurf — Direct Extension Install
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Installs verified production VSIX package with live status bar telemetry
                </Typography>
              </Box>
            </Box>

            <Tabs
              value={activeIdeTab}
              onChange={(_, v) => setActiveIdeTab(v)}
              sx={{
                borderBottom: `1px solid ${border}`,
                mb: 2.5,
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.84rem',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 0.75,
                  px: 2,
                  color: textMuted,
                  '&.Mui-selected': { color: accentPrimary, fontWeight: 800 }
                },
                '& .MuiTabs-indicator': { backgroundColor: accentPrimary, height: 2.5, borderRadius: 1 }
              }}
            >
              {IDE_TABS.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>

            <CodeBlock text={IDE_TABS[activeIdeTab].cmd} id={`ide-${activeIdeTab}`} />
            <Typography variant="caption" sx={{ color: textMuted, display: 'block', mt: 1.25, fontWeight: 600, fontSize: '0.78rem' }}>
              Platform: <strong>{IDE_TABS[activeIdeTab].note}</strong> · Displays 🛡 <em>ToolGuard ✓</em> in bottom status bar when cryptographic baseline matches.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
                href={VSIX_URL}
                download
                sx={{
                  textTransform: 'none',
                  borderRadius: '9px',
                  fontSize: '0.84rem',
                  fontWeight: 750,
                  borderColor: border,
                  color: 'text.primary',
                  px: 2.2,
                  py: 0.8,
                  '&:hover': { borderColor: accentPrimary }
                }}
              >
                Download VSIX Package Directly
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* ── CARD 3: WEB DASHBOARD / MANUAL BASELINE ───────────────────────── */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: '16px',
              backgroundColor: surface,
              borderColor: border,
              boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 6px 20px rgba(13,17,23,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{
                width: 42,
                height: 42,
                borderRadius: '11px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}>
                <HubOutlinedIcon sx={{ fontSize: 22, color: '#3B82F6' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.02em' }}>
                  3. Browser Console — Manual Drag &amp; Drop Baseline Sync
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Import your project's <code>.toolguard/baseline.json</code> directly for instant monitoring
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: border, mb: 3 }} />

            {importError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontWeight: 600 }}>
                {importError}
              </Alert>
            )}
            {importSuccess && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', fontWeight: 600 }}>
                Baseline loaded! Redirecting to Security Console…
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Project Identifier (optional)"
                  placeholder="e.g. backend-api"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9px',
                      backgroundColor: surfaceMuted,
                      '& fieldset': { borderColor: border }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadOutlinedIcon />}
                  fullWidth
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '9px',
                    borderColor: border,
                    color: 'text.primary',
                    fontWeight: 750,
                    py: 1.1,
                    '&:hover': { borderColor: accentPrimary }
                  }}
                >
                  Upload baseline.json
                  <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                </Button>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  size="small"
                  placeholder='Paste baseline JSON: { "baselineId": "...", "tools": { ... } }'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiInputBase-root': {
                      fontFamily: '"JetBrains Mono", monospace',
                      borderRadius: '9px',
                      fontSize: '0.82rem',
                      backgroundColor: surfaceMuted,
                      '& fieldset': { borderColor: border }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleImport}
                  disabled={importSuccess || !jsonText.trim()}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 750,
                    borderRadius: '9px',
                    px: 3,
                    py: 1
                  }}
                >
                  Load &amp; Protect Workspace
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
