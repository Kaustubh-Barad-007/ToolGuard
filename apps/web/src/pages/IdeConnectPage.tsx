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
      <IconButton size="small" onClick={() => copy(text, id)} sx={{ ml: 1, color: copiedKey === id ? '#10b981' : 'text.disabled', '&:hover': { color: 'text.primary' } }}>
        {copiedKey === id ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
      </IconButton>
    </Tooltip>
  );

  const CodeBlock = ({ text, id }: { text: string; id: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: codeBg, border: `1px solid ${border}`, borderRadius: '6px', px: 1.5, py: 1, fontFamily: 'monospace', fontSize: '0.8rem', color: isDark ? '#58a6ff' : '#0550ae' }}>
      <code style={{ flex: 1, wordBreak: 'break-all' }}>{text}</code>
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
    <Box sx={{ maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em', mb: 0.25 }}>
            Install &amp; Connect — Any IDE
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All downloads from <code>toolguard-app.vercel.app</code> · no npm registry required.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
          onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', background: '#f59e0b', boxShadow: 'none', color: '#fff', '&:hover': { background: '#d97706', boxShadow: 'none' } }}>
          Demo
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {/* ── Card 1: Universal CLI ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <TerminalIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  1. Universal CLI — JetBrains, Neovim, Sublime, Terminal, any editor
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Standalone binary, all dependencies bundled, Windows · macOS · Linux</Typography>
              </Box>
            </Box>
            <Grid container spacing={1.5}>
              {CLI_STEPS.map((step, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>{step.label}</Typography>
                  <CodeBlock text={step.cmd} id={`cli-${i}`} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>{step.note}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* ── Card 2: IDE Extension ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <CodeIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  2. VS Code / Cursor / Windsurf — 1-line download &amp; install
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Downloads VSIX directly from production, no marketplace needed</Typography>
              </Box>
            </Box>

            <Tabs
              value={activeIdeTab}
              onChange={(_, v) => setActiveIdeTab(v)}
              sx={{ borderBottom: `1px solid ${border}`, mb: 2, minHeight: 34, '& .MuiTab-root': { minHeight: 34, fontSize: '0.8rem', textTransform: 'none', fontWeight: 500, py: 0.5 }, '& .Mui-selected': { fontWeight: 600 } }}
            >
              {IDE_TABS.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>

            <CodeBlock text={IDE_TABS[activeIdeTab].cmd} id={`ide-${activeIdeTab}`} />
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.75 }}>
              {IDE_TABS[activeIdeTab].note} · shows 🛡 ToolGuard ✓ in status bar when baseline matches
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon sx={{ fontSize: '15px !important' }} />} href={VSIX_URL} download
                sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.78rem', borderColor: border, color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
                Download VSIX directly
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* ── Card 3: Web Dashboard ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', backgroundColor: surface, borderColor: border }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <HubOutlinedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  3. Web Dashboard — drag-drop connect
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  <strong>toolguard-app.vercel.app</strong> · drag-drop <code>.toolguard/baseline.json</code> · red Disconnect button to reset
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: border, mb: 2 }} />

            {importError  && <Alert severity="error"   sx={{ mb: 2, borderRadius: '6px' }}>{importError}</Alert>}
            {importSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '6px' }}>Loaded! Redirecting…</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Project name (optional)" placeholder="e.g. my-backend"
                  value={projectName} onChange={(e) => setProjectName(e.target.value)} sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }} />
                <Button variant="outlined" component="label" startIcon={<FileUploadOutlinedIcon />} fullWidth size="small"
                  sx={{ textTransform: 'none', borderRadius: '6px', borderColor: border, color: 'text.secondary' }}>
                  Upload baseline.json
                  <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField multiline rows={4} fullWidth size="small"
                  placeholder='Paste baseline JSON: { "baselineId": "...", "tools": { ... } }'
                  value={jsonText} onChange={(e) => setJsonText(e.target.value)}
                  sx={{ mb: 1.5, fontFamily: 'monospace', '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8rem' } }} />
                <Button variant="contained" onClick={handleImport} disabled={importSuccess || !jsonText.trim()}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', boxShadow: 'none' }}>
                  Load &amp; protect
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
