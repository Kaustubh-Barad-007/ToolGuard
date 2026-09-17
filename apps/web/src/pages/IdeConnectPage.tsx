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
  { label: 'Step 1 — Install globally',          cmd: `npm install -g ${TGZ_URL}`,    note: 'Bundles all dependencies. Works on Windows, macOS, Linux.' },
  { label: 'Step 2 — Init baseline',              cmd: 'toolguard init -y',             note: 'Run inside your project folder.' },
  { label: 'Step 3 — Scan anytime',              cmd: 'toolguard scan',                note: 'Verifies tools against the SHA-256 baseline.' },
  { label: 'Step 4 — Disconnect / reset',         cmd: 'toolguard disconnect',          note: 'Deletes .toolguard/ and purges all hashes.' },
];

const IDE_TABS = [
  { label: 'VS Code',        cmd: `curl.exe -LO ${VSIX_URL}; code --install-extension toolguard-vscode-1.0.0.vsix`,     note: 'PowerShell' },
  { label: 'Cursor',         cmd: `curl.exe -LO ${VSIX_URL}; cursor --install-extension toolguard-vscode-1.0.0.vsix`,   note: 'PowerShell' },
  { label: 'Windsurf',       cmd: `curl.exe -LO ${VSIX_URL}; windsurf --install-extension toolguard-vscode-1.0.0.vsix`, note: 'PowerShell' },
  { label: 'Mac / Linux',    cmd: `curl -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`,       note: 'Bash' },
];

export const IdeConnectPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { importWorkspaceBaseline, loadJudgeDemo } = useDemoData();

  const [copiedKey, setCopiedKey]     = useState<string | null>(null);
  const [activeIdeTab, setActiveIdeTab] = useState(0);
  const [jsonText, setJsonText]       = useState('');
  const [projectName, setProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const border  = isDark ? '#1f2937' : '#e2e8f0';
  const surface = isDark ? '#111827' : '#ffffff';
  const codeBg  = isDark ? '#0b0f19' : '#f8fafc';

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Tooltip title={copiedKey === id ? 'Copied!' : 'Copy'}>
      <IconButton size="small" onClick={() => copy(text, id)} sx={{ ml: 1, color: copiedKey === id ? '#059669' : 'text.disabled', '&:hover': { color: 'text.primary' } }}>
        {copiedKey === id ? <CheckIcon sx={{ fontSize: 15, color: '#059669' }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
      </IconButton>
    </Tooltip>
  );

  const CodeBlock = ({ text, id }: { text: string; id: string }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
      border: `1px solid ${border}`,
      borderRadius: '8px',
      px: 1.5,
      py: 1,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.8rem',
      color: isDark ? '#60a5fa' : '#0284c7'
    }}>
      <code style={{ flex: 1, wordBreak: 'break-all', fontFamily: 'inherit' }}>{text}</code>
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
      } catch { setImportError('Invalid JSON file.'); }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setImportError(null);
    if (!jsonText.trim()) { setImportError('Paste or upload your baseline.json.'); return; }
    try {
      const parsed = JSON.parse(jsonText.replace(/^\uFEFF/, '').trim());
      const ok = importWorkspaceBaseline(parsed, projectName.trim() || undefined);
      if (ok) { setImportSuccess(true); setTimeout(() => navigate('/dashboard'), 800); }
      else     { setImportError('Invalid baseline format. Must contain a "tools" object.'); }
    } catch { setImportError('Invalid JSON syntax.'); }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em', mb: 0.5 }}>
            Install &amp; Connect — Any IDE
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Zero-friction local setup · works across VS Code, Cursor, Windsurf, JetBrains, and universal CLI.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
          onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)', color: '#fff', px: 2, py: 0.7, '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' } }}>
          ⚡ Launch Demo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Card 1: Universal CLI ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 6px 18px -3px rgba(15,23,42,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '9px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TerminalIcon sx={{ fontSize: 19, color: '#059669' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  1. Universal CLI — Terminal, JetBrains, Neovim, Sublime
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Standalone binary, all dependencies bundled, Windows · macOS · Linux</Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {CLI_STEPS.map((step, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5, letterSpacing: '0.02em' }}>{step.label}</Typography>
                  <CodeBlock text={step.cmd} id={`cli-${i}`} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: '0.72rem' }}>{step.note}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* ── Card 2: IDE Extension ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 6px 18px -3px rgba(15,23,42,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '9px', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CodeIcon sx={{ fontSize: 19, color: '#4f46e5' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  2. VS Code / Cursor / Windsurf — 1-Line Download &amp; Install
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Downloads VSIX directly from production, no marketplace setup needed</Typography>
              </Box>
            </Box>

            <Tabs
              value={activeIdeTab}
              onChange={(_, v) => setActiveIdeTab(v)}
              sx={{
                borderBottom: `1px solid ${border}`,
                mb: 2,
                minHeight: 36,
                '& .MuiTab-root': { minHeight: 36, fontSize: '0.82rem', textTransform: 'none', fontWeight: 650, py: 0.5, color: 'text.secondary', '&.Mui-selected': { color: isDark ? '#10b981' : '#059669', fontWeight: 750 } },
                '& .MuiTabs-indicator': { backgroundColor: isDark ? '#10b981' : '#059669', height: 2.5, borderRadius: 1 }
              }}
            >
              {IDE_TABS.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>

            <CodeBlock text={IDE_TABS[activeIdeTab].cmd} id={`ide-${activeIdeTab}`} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, fontWeight: 500 }}>
              {IDE_TABS[activeIdeTab].note} · shows 🛡 ToolGuard ✓ in status bar when baseline matches
            </Typography>

            <Box sx={{ mt: 2.5 }}>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon sx={{ fontSize: '15px !important' }} />} href={VSIX_URL} download
                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 650, borderColor: border, color: 'text.primary', '&:hover': { borderColor: '#cbd5e1' } }}>
                Download VSIX directly
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* ── Card 3: Web Dashboard ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: surface, borderColor: border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 6px 18px -3px rgba(15,23,42,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '9px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HubOutlinedIcon sx={{ fontSize: 19, color: '#2563eb' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  3. Web Dashboard — Drag &amp; Drop Connect
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Import <code>.toolguard/baseline.json</code> directly to monitor in browser
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: border, mb: 2.5 }} />

            {importError  && <Alert severity="error"   sx={{ mb: 2, borderRadius: '8px' }}>{importError}</Alert>}
            {importSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>Loaded! Redirecting…</Alert>}

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Project name (optional)" placeholder="e.g. my-backend"
                  value={projectName} onChange={(e) => setProjectName(e.target.value)} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                <Button variant="outlined" component="label" startIcon={<FileUploadOutlinedIcon />} fullWidth size="small"
                  sx={{ textTransform: 'none', borderRadius: '8px', borderColor: border, color: 'text.primary', fontWeight: 650, py: 1 }}>
                  Upload baseline.json
                  <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField multiline rows={4} fullWidth size="small"
                  placeholder='Paste baseline JSON: { "baselineId": "...", "tools": { ... } }'
                  value={jsonText} onChange={(e) => setJsonText(e.target.value)}
                  sx={{ mb: 2, fontFamily: '"JetBrains Mono", monospace', '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.8rem' } }} />
                <Button variant="contained" onClick={handleImport} disabled={importSuccess || !jsonText.trim()}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, py: 0.8 }}>
                  Load &amp; Protect
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
