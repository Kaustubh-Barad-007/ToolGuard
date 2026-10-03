import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Chip,
  useTheme,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import WindowIcon from '@mui/icons-material/Window';
import AppleIcon from '@mui/icons-material/Apple';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useNavigate } from 'react-router-dom';
import { useDemoData } from '../context/DemoDataContext';

const VSIX_URL = 'https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix';
const TGZ_URL  = 'https://toolguard-app.vercel.app/toolguard.tgz';

type OsType = 'windows' | 'mac' | 'linux';

function detectOs(): OsType {
  const ua = (navigator.userAgent || '').toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac';
  return 'linux';
}

const OS_CONFIG: Record<OsType, {
  label: string;
  icon: React.ReactNode;
  installCmd: string;
  ideCmd: string;
  shell: string;
}> = {
  windows: {
    label: 'Windows',
    icon: <WindowIcon sx={{ fontSize: 16 }} />,
    installCmd: `irm ${TGZ_URL.replace('toolguard.tgz','install.ps1').replace('https://toolguard-app.vercel.app', 'https://toolguard-app.vercel.app')} | iex`,
    ideCmd: `curl.exe -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`,
    shell: 'PowerShell',
  },
  mac: {
    label: 'macOS',
    icon: <AppleIcon sx={{ fontSize: 16 }} />,
    installCmd: `curl -fsSL https://toolguard-app.vercel.app/install.sh | bash`,
    ideCmd: `curl -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`,
    shell: 'Terminal',
  },
  linux: {
    label: 'Linux',
    icon: <TerminalIcon sx={{ fontSize: 16 }} />,
    installCmd: `curl -fsSL https://toolguard-app.vercel.app/install.sh | bash`,
    ideCmd: `curl -LO ${VSIX_URL} && code --install-extension toolguard-vscode-1.0.0.vsix`,
    shell: 'Terminal',
  },
};

export const IdeConnectPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { importWorkspaceBaseline, isVerifying } = useDemoData();

  const [os, setOs] = useState<OsType>(detectOs());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Manual baseline import state
  const [jsonText, setJsonText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Theme tokens
  const border    = isDark ? '#2E2E2E' : '#E5E7EB';
  const surface   = isDark ? '#1C1C1C' : '#FFFFFF';
  const accent    = isDark ? '#3ECF8E' : '#00C475';
  const textMuted = isDark ? '#9E9E9E' : '#6B7280';
  const bg        = isDark ? '#171717' : '#F9FAFB';

  const osConf = OS_CONFIG[os];

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const markDone = (step: number) => {
    setCompletedSteps(prev => new Set(prev).add(step));
    setActiveStep(step + 1);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Tooltip title={copiedKey === id ? 'Copied!' : 'Copy command'}>
      <IconButton
        size="small"
        onClick={() => copy(text, id)}
        sx={{
          ml: 1,
          flexShrink: 0,
          color: copiedKey === id ? accent : textMuted,
          p: 0.6,
          borderRadius: '6px',
          '&:hover': { color: 'text.primary', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
        }}
      >
        {copiedKey === id
          ? <CheckIcon sx={{ fontSize: 15, color: accent }} />
          : <ContentCopyIcon sx={{ fontSize: 15 }} />}
      </IconButton>
    </Tooltip>
  );

  const CodeBlock = ({ text, id }: { text: string; id: string }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: isDark ? '#0D0D0D' : '#F4F4F5',
      border: `1px solid ${border}`,
      borderRadius: '8px',
      px: 2,
      py: 1.25,
      mt: 1.5,
      gap: 1,
    }}>
      <code style={{
        flex: 1,
        wordBreak: 'break-all',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '0.84rem',
        color: isDark ? '#A8E6CF' : '#065F46',
        lineHeight: 1.6,
      }}>
        {text}
      </code>
      <CopyBtn text={text} id={id} />
    </Box>
  );

  const StepDoneBadge = ({ step }: { step: number }) =>
    completedSteps.has(step) ? (
      <CheckCircleIcon sx={{ fontSize: 16, color: accent, ml: 0.5 }} />
    ) : null;

  // Steps config
  const steps = [
    {
      label: 'Install ToolGuard CLI',
      desc: `Paste this single command in your ${osConf.shell} — it installs everything automatically.`,
      cmd: osConf.installCmd,
      cmdId: `install-${os}`,
      note: `Requires Node.js 18+. If you don't have it, download from nodejs.org first.`,
      actionLabel: 'I ran this command ✓',
    },
    {
      label: 'Protect your project',
      desc: 'Open your project folder in terminal, then run these two commands:',
      multiCmd: [
        { label: 'Go to your project', cmd: 'cd /path/to/your-project', id: 'cd-step' },
        { label: 'Initialize ToolGuard', cmd: 'toolguard init -y', id: 'init-step' },
      ],
      note: 'This scans your project and creates a cryptographic baseline — like a fingerprint of your tools.',
      actionLabel: 'Baseline created ✓',
    },
    {
      label: 'Install the IDE Extension (VS Code / Cursor)',
      desc: 'Get real-time drift alerts right inside your editor:',
      optionA: {
        label: 'Run in terminal:',
        cmd: osConf.ideCmd,
        id: `ide-${os}`,
      },
      optionB: {
        label: 'Or download manually:',
        href: VSIX_URL,
        fileName: 'toolguard-vscode-1.0.0.vsix',
      },
      note: 'Works with VS Code, Cursor AI, and Windsurf. After installing, the ToolGuard shield icon appears in your status bar.',
      actionLabel: 'Extension installed ✓',
    },
    {
      label: 'Run your first scan',
      desc: 'Verify all your tools still match the trusted baseline:',
      cmd: 'toolguard scan',
      cmdId: 'scan-step',
      note: 'If everything matches, you\'ll see ✓ for each tool. You\'re now protected!',
      actionLabel: 'Scan done ✓',
    },
  ];

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
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="ToolGuard"
          sx={{ width: 52, height: 52, borderRadius: '12px', objectFit: 'cover', border: `1px solid ${border}`, flexShrink: 0 }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
            IDE &amp; CLI
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted }}>
            Connect your workspace, install the ToolGuard CLI, and enable real-time IDE extensions.
          </Typography>
        </Box>
      </Box>

      {/* OS Selector */}
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ color: textMuted, fontWeight: 500, fontSize: '0.84rem' }}>
          Your OS:
        </Typography>
        {(['windows', 'mac', 'linux'] as OsType[]).map((o) => (
          <Chip
            key={o}
            icon={OS_CONFIG[o].icon as any}
            label={OS_CONFIG[o].label}
            size="small"
            onClick={() => { setOs(o); setCompletedSteps(new Set()); setActiveStep(0); }}
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 0.5,
              borderRadius: '20px',
              backgroundColor: os === o
                ? (isDark ? 'rgba(62, 207, 142, 0.15)' : 'rgba(0, 196, 117, 0.12)')
                : 'transparent',
              color: os === o ? accent : textMuted,
              border: `1px solid ${os === o ? accent : border}`,
              '& .MuiChip-icon': { color: 'inherit' },
              '&:hover': { borderColor: accent, color: accent },
            }}
          />
        ))}
        <Chip
          label="Detected automatically"
          size="small"
          sx={{
            fontSize: '0.72rem',
            color: textMuted,
            backgroundColor: 'transparent',
            border: `1px dashed ${border}`,
            ml: 0.5,
          }}
        />
      </Box>

      {/* Step-by-Step Stepper */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: '10px', backgroundColor: surface, borderColor: border, mb: 3, overflow: 'hidden' }}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            p: 0,
            '& .MuiStepLabel-root': { py: 2, px: 3 },
            '& .MuiStepContent-root': { px: 3, pb: 3, ml: '36px', borderLeft: `1px solid ${border}` },
            '& .MuiStepConnector-line': { borderColor: border },
            '& .MuiStepIcon-root': {
              color: isDark ? '#333' : '#E5E7EB',
              '&.Mui-active': { color: accent },
              '&.Mui-completed': { color: accent },
            },
            '& .MuiStepLabel-label': {
              fontWeight: 600,
              fontSize: '0.92rem',
              color: 'text.primary',
              '&.Mui-active': { color: 'text.primary' },
              '&.Mui-completed': { color: textMuted },
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={index} completed={completedSteps.has(index)}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
                optional={
                  completedSteps.has(index) && (
                    <Typography variant="caption" sx={{ color: accent, fontWeight: 600, fontSize: '0.72rem' }}>
                      Done
                    </Typography>
                  )
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5, fontSize: '0.88rem', lineHeight: 1.65 }}>
                  {step.desc}
                </Typography>

                {/* Single command step */}
                {'cmd' in step && step.cmd && (
                  <CodeBlock text={step.cmd} id={step.cmdId!} />
                )}

                {/* Multi-command step */}
                {'multiCmd' in step && step.multiCmd && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {step.multiCmd.map((mc) => (
                      <Box key={mc.id}>
                        <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.73rem', display: 'block', mb: 0.25 }}>
                          {mc.label}
                        </Typography>
                        <CodeBlock text={mc.cmd} id={mc.id} />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* IDE Extension step: dual option */}
                {'optionA' in step && step.optionA && (
                  <Box>
                    <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.73rem', display: 'block', mb: 0.25 }}>
                      {step.optionA.label}
                    </Typography>
                    <CodeBlock text={step.optionA.cmd} id={step.optionA.id} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, mb: 0.5 }}>
                      <Box sx={{ flex: 1, height: '1px', backgroundColor: border }} />
                      <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.72rem' }}>OR</Typography>
                      <Box sx={{ flex: 1, height: '1px', backgroundColor: border }} />
                    </Box>

                    <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.73rem', display: 'block', mb: 0.75, mt: 0.75 }}>
                      {step.optionB?.label}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                      href={step.optionB?.href}
                      download
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        borderRadius: '7px',
                        borderColor: border,
                        color: textMuted,
                        px: 2,
                        py: 0.7,
                        '&:hover': { borderColor: accent, color: accent }
                      }}
                    >
                      Download {step.optionB?.fileName}
                    </Button>
                  </Box>
                )}

                {/* Note */}
                {'note' in step && step.note && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1.75,
                      color: textMuted,
                      fontSize: '0.78rem',
                      lineHeight: 1.6,
                      px: 1.5,
                      py: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                      borderRadius: '6px',
                      border: `1px solid ${border}`,
                    }}
                  >
                    💡 {step.note}
                  </Typography>
                )}

                {/* Action button */}
                <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => markDone(index)}
                    disabled={completedSteps.has(index)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '7px',
                      backgroundColor: completedSteps.has(index) ? (isDark ? '#1A3D2E' : '#D1FAE5') : accent,
                      color: completedSteps.has(index) ? accent : (isDark ? '#121212' : '#FFFFFF'),
                      px: 2.25,
                      py: 0.7,
                      boxShadow: 'none',
                      '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
                      '&.Mui-disabled': {
                        backgroundColor: isDark ? '#1A3D2E' : '#D1FAE5',
                        color: accent,
                      }
                    }}
                  >
                    {completedSteps.has(index)
                      ? `✓ ${step.actionLabel}`
                      : step.actionLabel}
                  </Button>
                  {index > 0 && (
                    <Button
                      size="small"
                      onClick={() => setActiveStep(index - 1)}
                      sx={{ textTransform: 'none', color: textMuted, fontSize: '0.78rem', '&:hover': { color: 'text.primary' } }}
                    >
                      ← Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* All done! Banner */}
      {completedSteps.size === steps.length && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
          sx={{
            mb: 3,
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(62,207,142,0.35)' : '#A7F3D0'}`,
            backgroundColor: isDark ? 'rgba(62,207,142,0.08)' : '#ECFDF5',
            fontSize: '0.86rem',
            fontWeight: 500,
          }}
        >
          <strong>You're fully protected!</strong> ToolGuard is now actively monitoring your project for capability drift. Head to the Dashboard to see your security status.
          <Box sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/dashboard')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: '7px',
                backgroundColor: accent,
                color: isDark ? '#121212' : '#FFFFFF',
                px: 2.5,
                boxShadow: 'none',
                '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
              }}
            >
              Go to Dashboard →
            </Button>
          </Box>
        </Alert>
      )}

      {/* Advanced: Manual Baseline Sync */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: '10px', backgroundColor: surface, borderColor: border, p: 3 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textMuted, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
          Advanced
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.92rem', mb: 0.5 }}>
          Import Existing Baseline
        </Typography>
        <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.84rem', mb: 2 }}>
          Already have a <code style={{ fontFamily: 'monospace', fontSize: '0.8em' }}>.toolguard/baseline.json</code> file? Upload it here to sync your workspace with this dashboard.
        </Typography>

        {importError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '7px', fontSize: '0.82rem' }}>{importError}</Alert>
        )}
        {importSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '7px', fontSize: '0.82rem' }}>
            ✓ Baseline imported — redirecting to dashboard…
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Project name (optional)"
            placeholder="e.g. my-app"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            sx={{
              flex: '1 1 180px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '7px', fontSize: '0.82rem',
                '& fieldset': { borderColor: border }
              }
            }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '7px',
              borderColor: border,
              color: textMuted,
              fontWeight: 600,
              fontSize: '0.82rem',
              px: 2,
              py: 0.8,
              '&:hover': { borderColor: accent, color: accent }
            }}
          >
            Upload baseline.json
            <input type="file" accept=".json" hidden onChange={handleFileUpload} />
          </Button>
        </Box>

        <TextField
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder='Or paste your baseline JSON here: { "baselineId": "...", "tools": { ... } }'
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-root': {
              fontFamily: '"JetBrains Mono", monospace',
              borderRadius: '7px',
              fontSize: '0.78rem',
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
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: '7px',
            px: 2.5,
            py: 0.7,
            backgroundColor: accent,
            color: isDark ? '#121212' : '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
          }}
        >
          Import Baseline →
        </Button>
      </Paper>
    </Box>
  );
};
