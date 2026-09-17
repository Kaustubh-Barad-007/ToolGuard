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
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import CodeIcon from '@mui/icons-material/Code';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useNavigate } from 'react-router-dom';
import { useDemoData } from '../context/DemoDataContext';

const VSIX_URL  = 'https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix';
const TGZ_URL   = 'https://toolguard-app.vercel.app/toolguard.tgz';

const CLI_STEPS = [
  { label: '1. Global Installation', cmd: `npm install -g ${TGZ_URL}`, note: 'Node.js 18+ · Windows, macOS, and Linux' },
  { label: '2. Baseline Initialization', cmd: 'toolguard init -y', note: 'Discovers package.json and MCP manifests into baseline.json' },
  { label: '3. Verification Scan', cmd: 'toolguard scan', note: 'Verifies active capabilities against your local baseline' },
  { label: '4. Disconnect Project', cmd: 'toolguard disconnect', note: 'Unlinks local monitoring and removes baseline state' },
];

const IDE_TABS = [
  { label: 'VS Code', cmd: `curl.exe -LO ${VSIX_URL}; code --install-extension toolguard-vscode-1.0.0.vsix`, note: 'PowerShell / CMD' },
  { label: 'Cursor AI', cmd: `curl.exe -LO ${VSIX_URL}; cursor --install-extension toolguard-vscode-1.0.0.vsix`, note: 'PowerShell / CMD' },
  { label: 'Windsurf', cmd: `curl.exe -LO ${VSIX_URL}; windsurf --install-extension toolguard-vscode-1.0.0.vsix`, note: 'PowerShell / CMD' },
  { label: 'macOS / Linux', cmd: `curl -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`, note: 'Bash / Zsh' },
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

  const border       = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const surface      = isDark ? '#0d1117' : '#ffffff';
  const surfaceMuted = isDark ? '#080c10' : '#f6f8fa';
  const accent       = isDark ? '#00d4aa' : '#008b72';
  const textMuted    = isDark ? '#8b949e' : '#57606a';

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Tooltip title={copiedKey === id ? 'Copied' : 'Copy'}>
      <IconButton
        size="small"
        onClick={() => copy(text, id)}
        sx={{
          ml: 1,
          color: copiedKey === id ? accent : textMuted,
          p: 0.5,
          borderRadius: '4px',
          '&:hover': { color: 'text.primary' }
        }}
      >
        {copiedKey === id ? <CheckIcon sx={{ fontSize: 15, color: accent }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
      </IconButton>
    </Tooltip>
  );

  const CodeBlock = ({ text, id }: { text: string; id: string }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: surfaceMuted,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      px: 1.5,
      py: 1,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.8rem',
      color: isDark ? '#e6edf3' : '#24292f'
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
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Integrations &amp; Setup
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, mt: 0.25 }}>
            Connect ToolGuard through the CLI, IDE extensions, or manual baseline synchronization.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.82rem',
            borderRadius: '6px',
            borderColor: border,
            color: textMuted,
            px: 1.75,
            py: 0.6,
            '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
          }}
        >
          Load Demo Workspace
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {/* CLI Section */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '10px',
              backgroundColor: surface,
              borderColor: border,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
              <TerminalOutlinedIcon sx={{ fontSize: 20, color: accent }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.94rem' }}>
                  CLI Installation
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Standalone executable for terminal workflows, pre-commit hooks, and CI/CD pipelines
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {CLI_STEPS.map((step, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '0.74rem' }}>
                    {step.label}
                  </Typography>
                  <CodeBlock text={step.cmd} id={`cli-${i}`} />
                  <Typography variant="caption" sx={{ color: textMuted, display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
                    {step.note}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* IDE Extensions */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '10px',
              backgroundColor: surface,
              borderColor: border,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <CodeIcon sx={{ fontSize: 20, color: accent }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.94rem' }}>
                  Editor Extensions (VS Code, Cursor, Windsurf)
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Installs background file-watcher with real-time status bar indicators
                </Typography>
              </Box>
            </Box>

            <Tabs
              value={activeIdeTab}
              onChange={(_, v) => setActiveIdeTab(v)}
              sx={{
                borderBottom: `1px solid ${border}`,
                mb: 2,
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 0.5,
                  px: 1.75,
                  color: textMuted,
                  '&.Mui-selected': { color: 'text.primary', fontWeight: 600 }
                },
                '& .MuiTabs-indicator': { backgroundColor: accent, height: 2 }
              }}
            >
              {IDE_TABS.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>

            <CodeBlock text={IDE_TABS[activeIdeTab].cmd} id={`ide-${activeIdeTab}`} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.76rem' }}>
                Target shell: <strong>{IDE_TABS[activeIdeTab].note}</strong>
              </Typography>
              <Button
                variant="text"
                size="small"
                startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                href={VSIX_URL}
                download
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  color: textMuted,
                  fontWeight: 500,
                  '&:hover': { color: 'text.primary' }
                }}
              >
                Download .vsix directly
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Manual Baseline Sync */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '10px',
              backgroundColor: surface,
              borderColor: border,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <UploadFileOutlinedIcon sx={{ fontSize: 20, color: accent }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.94rem' }}>
                  Manual Baseline Sync
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  Import an existing <code>.toolguard/baseline.json</code> directly into this browser console
                </Typography>
              </Box>
            </Box>

            {importError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '6px', fontSize: '0.82rem' }}>
                {importError}
              </Alert>
            )}
            {importSuccess && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: '6px', fontSize: '0.82rem' }}>
                Baseline loaded. Redirecting to console…
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Project Identifier (optional)"
                  placeholder="e.g. core-api"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      backgroundColor: surfaceMuted,
                      '& fieldset': { borderColor: border }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                  fullWidth
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '6px',
                    borderColor: border,
                    color: textMuted,
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    py: 0.8,
                    '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
                  }}
                >
                  Upload baseline.json
                  <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                </Button>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  placeholder='Paste baseline JSON: { "baselineId": "...", "tools": { ... } }'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  sx={{
                    mb: 1.5,
                    '& .MuiInputBase-root': {
                      fontFamily: '"JetBrains Mono", monospace',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      backgroundColor: surfaceMuted,
                      '& fieldset': { borderColor: border }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleImport}
                  disabled={importSuccess || !jsonText.trim()}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    px: 2,
                    py: 0.6
                  }}
                >
                  Import Baseline
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
