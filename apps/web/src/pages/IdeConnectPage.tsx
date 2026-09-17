import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Divider,
  Tabs,
  Tab,
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
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useNavigate } from 'react-router-dom';
import { useDemoData } from '../context/DemoDataContext';

export const IdeConnectPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { importWorkspaceBaseline, loadJudgeDemo } = useDemoData();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeIdeTab, setActiveIdeTab] = useState(0);

  // File import state
  const [jsonText, setJsonText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      try {
        const parsed = JSON.parse(content);
        if (parsed.projectId && !projectName) {
          setProjectName(parsed.projectId);
        }
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    if (!jsonText.trim()) {
      setImportError('Please paste or upload your baseline.json file.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const success = importWorkspaceBaseline(parsed, projectName.trim() || undefined);
      if (success) {
        setImportSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setImportError('Invalid baseline format. Ensure it contains a "tools" object.');
      }
    } catch {
      setImportError('Syntax error: please provide valid JSON.');
    }
  };

  const ideCommands = [
    {
      label: 'VS Code',
      cmd: 'curl.exe -LO https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix; code --install-extension toolguard-vscode-1.0.0.vsix',
      note: 'PowerShell 1-line download and install'
    },
    {
      label: 'Cursor',
      cmd: 'curl.exe -LO https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix; cursor --install-extension toolguard-vscode-1.0.0.vsix',
      note: 'PowerShell 1-line download and install'
    },
    {
      label: 'Windsurf',
      cmd: 'curl.exe -LO https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix; windsurf --install-extension toolguard-vscode-1.0.0.vsix',
      note: 'PowerShell 1-line download and install'
    },
    {
      label: 'Mac / Linux / Bash',
      cmd: 'curl -LO https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix && code --install-extension toolguard-vscode-1.0.0.vsix',
      note: 'Bash 1-line download and install'
    }
  ];

  const cliInstallCmd = 'npm install -g https://toolguard-app.vercel.app/toolguard.tgz';
  const cliInitCmd = 'toolguard init -y';
  const cliScanCmd = 'toolguard scan';
  const cliDisconnectCmd = 'toolguard disconnect';

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Exact Commands to Install & Connect Across ANY IDE
            </Typography>
            <Chip label="PRODUCTION READY" size="small" sx={{ height: 22, fontSize: '0.66rem', fontWeight: 750, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }} />
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Zero-Trust Capability Verification & Automated Trust Drift Detection.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<BoltIcon />}
          onClick={() => {
            loadJudgeDemo();
            navigate('/drift');
          }}
          sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            fontWeight: 750,
            textTransform: 'none',
            boxShadow: '0 3px 12px rgba(245, 158, 11, 0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
          }}
        >
          ⚡ Hackathon Judge Demo (1-Click)
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* 1. Universal CLI Card */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}
              >
                <TerminalIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
                  1. Universal CLI (Works for Any Project & Editor: JetBrains, Neovim, Sublime, Terminal)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Single standalone binary bundled with all dependencies for Windows, macOS, and Linux
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {/* Step 1 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  Step 1: Install globally (1-line)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  (Installs the standalone binary with all dependencies bundled inside).
                </Typography>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <code style={{ wordBreak: 'break-all' }}>{cliInstallCmd}</code>
                  <Tooltip title={copiedKey === 'install' ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={() => handleCopy(cliInstallCmd, 'install')} sx={{ ml: 1 }}>
                      {copiedKey === 'install' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Step 2 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  Step 2: Initialize & lock tools in your project folder
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Run inside target workspace: <code>cd /path/to/your/project</code>
                </Typography>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <code>{cliInitCmd}</code>
                  <Tooltip title={copiedKey === 'init' ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={() => handleCopy(cliInitCmd, 'init')} sx={{ ml: 1 }}>
                      {copiedKey === 'init' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Step 3 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  Step 3: Scan tools anytime
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Verifies workspace tools against cryptographic SHA-256 baseline.
                </Typography>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <code>{cliScanCmd}</code>
                  <Tooltip title={copiedKey === 'scan' ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={() => handleCopy(cliScanCmd, 'scan')} sx={{ ml: 1 }}>
                      {copiedKey === 'scan' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Step 4 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  Step 4: Disconnect / Delete Project Baseline
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  (Completely deletes .toolguard/ and purges all baseline hashes).
                </Typography>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <code>{cliDisconnectCmd}</code>
                  <Tooltip title={copiedKey === 'disconnect' ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={() => handleCopy(cliDisconnectCmd, 'disconnect')} sx={{ ml: 1 }}>
                      {copiedKey === 'disconnect' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 2. VS Code, Cursor & Windsurf Card */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(0, 122, 204, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#007acc'
                }}
              >
                <CodeIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
                  2. VS Code, Cursor & Windsurf (1-Line Download & Install)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Run this single line in PowerShell (or Bash) to download the package directly from production and install it:
                </Typography>
              </Box>
            </Box>

            {/* IDE Selection Tabs */}
            <Tabs
              value={activeIdeTab}
              onChange={(_, val) => setActiveIdeTab(val)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              {ideCommands.map((ide, idx) => (
                <Tab key={idx} label={ide.label} sx={{ textTransform: 'none', fontWeight: 650, fontSize: '0.85rem' }} />
              ))}
            </Tabs>

            {/* Selected IDE Command Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                wordBreak: 'break-all'
              }}
            >
              <code>{ideCommands[activeIdeTab].cmd}</code>
              <Tooltip title={copiedKey === `ide-${activeIdeTab}` ? 'Copied!' : 'Copy command'}>
                <IconButton size="small" onClick={() => handleCopy(ideCommands[activeIdeTab].cmd, `ide-${activeIdeTab}`)} sx={{ ml: 1 }}>
                  {copiedKey === `ide-${activeIdeTab}` ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ✓ Shows <code>🛡 ToolGuard ✓</code> in bottom status bar when tools match baseline.<br />
                ✓ Alerts with <code>🛡 ToolGuard ⚠ DRIFT</code> the instant unauthorized capabilities shift.
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                href="https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix"
                download
                sx={{ textTransform: 'none', fontWeight: 650 }}
              >
                Download VSIX directly
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 3. Web Dashboard (Connect & Disconnect Online) */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
                }}
              >
                <HubOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
                  3. Web Dashboard (Connect & Disconnect Online)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Live Dashboard: <strong>https://toolguard-app.vercel.app</strong>
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              • <strong>To Connect:</strong> Drag and drop your project's <code>.toolguard/baseline.json</code> directly into the page.<br />
              • <strong>To Disconnect:</strong> Click the red <strong>Disconnect</strong> button in the top project banner to reset to a clean zero-project state.
            </Typography>

            {importError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {importError}
              </Alert>
            )}

            {importSuccess && (
              <Alert severity="success" sx={{ mb: 2.5 }}>
                ✓ Baseline loaded successfully! Redirecting to Dashboard...
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Project Name (Optional)"
                  placeholder="e.g. My-App, Backend-API"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadOutlinedIcon />}
                  fullWidth
                  sx={{ textTransform: 'none', py: 1 }}
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
                  placeholder='Paste baseline JSON here: { "baselineId": "...", "tools": { ... } }'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mb: 2 }}
                />

                <Button
                  variant="contained"
                  onClick={handleImportSubmit}
                  disabled={importSuccess || !jsonText.trim()}
                  sx={{ textTransform: 'none', fontWeight: 700, px: 3 }}
                >
                  Load & Protect Project
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
