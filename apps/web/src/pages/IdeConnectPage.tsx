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
  Divider
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

export const IdeConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { importWorkspaceBaseline, loadJudgeDemo } = useDemoData();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const githubRepo = 'https://github.com/Kaustubh-Barad-007/ToolGuard';
  const vsixDownloadUrl = `${githubRepo}/raw/main/apps/vscode-extension/toolguard-vscode-1.0.0.vsix`;
  const vscodeCmd = 'code --install-extension toolguard-vscode-1.0.0.vsix';
  const cliInitCmd = 'toolguard init -y';
  const cliInstallCmd = 'npm install -g https://toolguard-app.vercel.app/toolguard.tgz';

  return (
    <Box sx={{ maxWidth: 960 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Connect Any Project
            </Typography>
            <Chip label="1-LINE SETUP" size="small" sx={{ height: 22, fontSize: '0.66rem', fontWeight: 750, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }} />
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Lock capabilities and start detecting trust drift in under 30 seconds.
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
          ⚡ Hackathon Judge Demo
        </Button>
      </Box>

      {/* 3 Simple Setup Cards */}
      <Grid container spacing={3}>
        {/* Method 1: VS Code (1-Line) */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 2
            }}
          >
            <Box>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 750, color: 'text.primary' }}>
                    VS Code Extension (1-Line Setup)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Zero-config status bar verification & on-save drift scan
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Download the extension package from GitHub and install with one command:
              </Typography>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  wordBreak: 'break-all'
                }}
              >
                <code>{vscodeCmd}</code>
                <Tooltip title={copiedKey === 'vscode' ? 'Copied!' : 'Copy command'}>
                  <IconButton size="small" onClick={() => handleCopy(vscodeCmd, 'vscode')} sx={{ ml: 1 }}>
                    {copiedKey === 'vscode' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                ✓ Works automatically when you open any project folder in VS Code.<br />
                ✓ Status bar shield shows <code>🛡 ToolGuard ✓</code> or alert if drift occurs.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                href={vsixDownloadUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ textTransform: 'none', fontWeight: 650 }}
              >
                Download from GitHub
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="/toolguard-vscode-1.0.0.vsix"
                download
                sx={{ textTransform: 'none', fontWeight: 650 }}
              >
                Direct VSIX
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Method 2: Terminal CLI (1-Line) */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 2
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 750, color: 'text.primary' }}>
                    Terminal CLI (Any Project)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Node, Python, Makefiles, Go, Rust, or MCP Agents
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Inside your target project folder, run this single line to discover tools and freeze the baseline:
              </Typography>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <code>{cliInitCmd}</code>
                <Tooltip title={copiedKey === 'cli' ? 'Copied!' : 'Copy command'}>
                  <IconButton size="small" onClick={() => handleCopy(cliInitCmd, 'cli')} sx={{ ml: 1 }}>
                    {copiedKey === 'cli' ? <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                ✓ Run anywhere: <code>toolguard scan</code> | <code>toolguard status</code><br />
                ✓ If installing on a fresh machine or CI: <code>{cliInstallCmd}</code>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCopy('toolguard scan', 'scan-cmd')}
                sx={{ textTransform: 'none', fontWeight: 650 }}
              >
                {copiedKey === 'scan-cmd' ? 'Copied scan cmd' : 'Copy scan command'}
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => handleCopy(cliInstallCmd, 'install-cmd')}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary' }}
              >
                {copiedKey === 'install-cmd' ? 'Copied global install' : 'Copy global install command'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Method 3: Instant File Upload */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2
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
                <FileUploadOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 750, color: 'text.primary' }}>
                  Option 3: Direct Baseline Upload / Paste
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Drag & drop your .toolguard/baseline.json file or paste output from <code>toolguard export</code>
                </Typography>
              </Box>
            </Box>

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
