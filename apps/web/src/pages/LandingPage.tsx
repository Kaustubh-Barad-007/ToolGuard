import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import BoltIcon from '@mui/icons-material/Bolt';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import CodeIcon from '@mui/icons-material/Code';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDemoData } from '../context/DemoDataContext';

export const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { loadJudgeDemo, isVerifying, loadIdeWorkspace } = useDemoData();

  const [installTab, setInstallTab] = useState<'windows' | 'mac' | 'npm'>('windows');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const border       = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const surface      = isDark ? '#0d1117' : '#ffffff';
  const surfaceMuted = isDark ? '#080c10' : '#f6f8fa';
  const accent       = isDark ? '#00d4aa' : '#008b72';
  const danger       = isDark ? '#f85149' : '#cf222e';
  const warning      = isDark ? '#d29922' : '#9a6700';
  const textMuted    = isDark ? '#8b949e' : '#57606a';

  const installCommands = {
    windows: 'irm https://toolguard-app.vercel.app/install.ps1 | iex',
    mac: 'curl -fsSL https://toolguard-app.vercel.app/install.sh | bash',
    npm: 'npm install -g https://toolguard-app.vercel.app/toolguard.tgz\ntoolguard quickstart'
  };

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', pb: 10 }}>
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <Box sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 5, md: 7 }, textAlign: 'center', maxWidth: 840, mx: 'auto' }}>
        <Chip
          icon={<ShieldOutlinedIcon sx={{ fontSize: '15px !important', color: `${accent} !important` }} />}
          label="Zero-Trust Capability Verification for AI Tools & Agents"
          size="small"
          sx={{
            height: 28,
            px: 1,
            mb: 3,
            fontSize: '0.76rem',
            fontWeight: 650,
            borderRadius: '14px',
            backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)',
            color: accent,
            border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 139, 114, 0.2)'}`,
          }}
        />

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 850,
            fontSize: { xs: '2.1rem', sm: '2.85rem', md: '3.3rem' },
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: 'text.primary',
            mb: 2.5
          }}
        >
          You trusted the tool.<br />
          <Box component="span" sx={{ color: accent }}>Did the tool stay the same?</Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '0.95rem', md: '1.08rem' },
            color: textMuted,
            maxWidth: 680,
            mx: 'auto',
            lineHeight: 1.65,
            mb: 4
          }}
        >
          AI agents execute MCP servers, terminal scripts, and filesystem tools with full access.
          ToolGuard establishes an immutable <strong>SHA-256 cryptographic baseline</strong> of tool capabilities
          and blocks <strong>silent privilege escalation</strong> before execution.
        </Typography>

        {/* Hero CTA Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '7px',
              px: 2.75,
              py: 1,
              backgroundColor: isDark ? '#10b981' : '#059669',
              color: '#ffffff',
              '&:hover': { backgroundColor: isDark ? '#059669' : '#047857' }
            }}
          >
            Launch Live Console
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<BoltIcon sx={{ fontSize: 16 }} />}
            onClick={() => { loadJudgeDemo(); navigate('/drift'); }}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              fontSize: '0.9rem',
              borderRadius: '7px',
              px: 2.5,
              py: 1,
              borderColor: border,
              color: 'text.primary',
              '&:hover': { borderColor: warning, color: warning }
            }}
          >
            Simulate Threat Attack
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
            disabled={isVerifying}
            onClick={() => loadIdeWorkspace()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '7px',
              px: 2.25,
              py: 1,
              borderColor: border,
              color: textMuted,
              '&:hover': { borderColor: accent, color: accent }
            }}
          >
            Load IDE Project
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: textMuted, display: 'block', fontSize: '0.76rem' }}>
          100% Local-First · Zero Telemetry · Cryptographically Verifiable · Open-Source
        </Typography>
      </Box>

      {/* ── 1-LINE FAST INSTALL TERMINAL BOX ─────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 8,
          borderRadius: '12px',
          backgroundColor: surface,
          borderColor: border,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalOutlinedIcon sx={{ fontSize: 18, color: accent }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.86rem' }}>
              Instant 1-Line Installer
            </Typography>
            <Chip
              label="Auto-Configures VS Code &amp; Cursor"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 650,
                borderRadius: '4px',
                backgroundColor: isDark ? 'rgba(0, 212, 170, 0.12)' : 'rgba(0, 139, 114, 0.1)',
                color: accent,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            <Chip
              label="Windows (PowerShell)"
              size="small"
              clickable
              onClick={() => setInstallTab('windows')}
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 650,
                borderRadius: '6px',
                backgroundColor: installTab === 'windows' ? (isDark ? 'rgba(0, 212, 170, 0.15)' : 'rgba(0, 139, 114, 0.12)') : 'transparent',
                color: installTab === 'windows' ? accent : textMuted,
                border: `1px solid ${installTab === 'windows' ? accent : border}`,
              }}
            />
            <Chip
              label="macOS / Linux"
              size="small"
              clickable
              onClick={() => setInstallTab('mac')}
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 650,
                borderRadius: '6px',
                backgroundColor: installTab === 'mac' ? (isDark ? 'rgba(0, 212, 170, 0.15)' : 'rgba(0, 139, 114, 0.12)') : 'transparent',
                color: installTab === 'mac' ? accent : textMuted,
                border: `1px solid ${installTab === 'mac' ? accent : border}`,
              }}
            />
            <Chip
              label="NPM"
              size="small"
              clickable
              onClick={() => setInstallTab('npm')}
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 650,
                borderRadius: '6px',
                backgroundColor: installTab === 'npm' ? (isDark ? 'rgba(0, 212, 170, 0.15)' : 'rgba(0, 139, 114, 0.12)') : 'transparent',
                color: installTab === 'npm' ? accent : textMuted,
                border: `1px solid ${installTab === 'npm' ? accent : border}`,
              }}
            />
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: surfaceMuted,
          border: `1px solid ${border}`,
          borderRadius: '8px',
          p: 1.5,
        }}>
          <Typography
            component="code"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.82rem',
              color: isDark ? '#e6edf3' : '#24292f',
              wordBreak: 'break-all',
              flexGrow: 1
            }}
          >
            {installCommands[installTab]}
          </Typography>
          <Tooltip title={copiedCmd ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size="small"
              onClick={() => handleCopy(installCommands[installTab])}
              sx={{ ml: 1, color: copiedCmd ? accent : textMuted }}
            >
              {copiedCmd ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── SECTION 1: THE REAL PROBLEM ──────────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4.5 }}>
          <Typography variant="overline" sx={{ color: danger, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem' }}>
            THE SECURITY BLINDSPOT
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', color: 'text.primary', mt: 0.5 }}>
            Why Traditional Security Fails with AI Tools
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, maxWidth: 620, mx: 'auto', mt: 1 }}>
            Autonomous coding assistants execute tools based on static text manifests.
            Here is why your developer environment is vulnerable:
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: border,
                transition: 'border-color 0.15s ease',
                '&:hover': { borderColor: danger }
              }}
            >
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)',
                color: danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <WarningAmberIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '0.94rem' }}>
                1. Silent Privilege Escalation
              </Typography>
              <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>
                You authorize a read-only filesystem or code reviewer tool. An upstream Git merge, malicious package update,
                or prompt injection quietly adds <code>admin</code> permissions or changes the target command to an exfiltration runner.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: border,
                transition: 'border-color 0.15s ease',
                '&:hover': { borderColor: danger }
              }}
            >
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)',
                color: danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <FingerprintOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '0.94rem' }}>
                2. Unchecked Tool Manifests
              </Typography>
              <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>
                MCP servers, <code>package.json</code> scripts, and VS Code task configurations are unencrypted, unverified text files.
                The AI agent blindly assumes the file in front of it is still the trusted one you authorized.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: border,
                transition: 'border-color 0.15s ease',
                '&:hover': { borderColor: danger }
              }}
            >
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)',
                color: danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <SecurityOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '0.94rem' }}>
                3. The Scanner Blindspot
              </Typography>
              <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>
                Traditional scanners (Snyk, SonarQube) inspect your application source code for syntax flaws. TruffleHog checks for leaked secrets.
                <strong> None of them monitor agent tool manifests for runtime capability drift.</strong>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ── SECTION 2: HOW TOOLGUARD SOLVES IT ─────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4.5 }}>
          <Typography variant="overline" sx={{ color: accent, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem' }}>
            THE CRYPTOGRAPHIC DEFENSE
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', color: 'text.primary', mt: 0.5 }}>
            How ToolGuard Solves It
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, maxWidth: 620, mx: 'auto', mt: 1 }}>
            Four interlocking layers of zero-trust verification from authorization to runtime execution:
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {[
            {
              step: '01',
              title: 'Universal Tool Discovery',
              desc: 'Discovers tools across Model Context Protocol (MCP) configs, package.json scripts, VS Code tasks, and agent prompts in <1 second.',
              icon: <LayersOutlinedIcon sx={{ fontSize: 20 }} />
            },
            {
              step: '02',
              title: 'SHA-256 Canonical Baseline',
              desc: 'Applies canonical JSON serialization, strips Windows UTF-8 BOM, and hashes permissions, parameters, and commands into .toolguard/baseline.json.',
              icon: <LockOutlinedIcon sx={{ fontSize: 20 }} />
            },
            {
              step: '03',
              title: 'Multi-Layer Continuous Enforcement',
              desc: 'Verifies capabilities in terminal scans (~80ms), blocks tainted Git commits via pre-commit hooks, and flags IDE diagnostics in VS Code & Cursor.',
              icon: <SpeedOutlinedIcon sx={{ fontSize: 20 }} />
            },
            {
              step: '04',
              title: 'Actionable Remediation & Rollback',
              desc: 'Pinpoints exact before/after property diffs, enables 1-click baseline rollback, and lets developers permanently delete rogue tools.',
              icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} key={item.step}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '10px',
                  backgroundColor: surface,
                  borderColor: border,
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: accent }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '7px',
                    backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)',
                    color: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.8rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    color: textMuted
                  }}>
                    {item.step}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, fontSize: '0.94rem' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── SECTION 3: COMPARISON MATRIX ─────────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="overline" sx={{ color: textMuted, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem' }}>
            SECURITY ECOSYSTEM COMPARISON
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', color: 'text.primary', mt: 0.5 }}>
            Why ToolGuard is Unique
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: surface,
            borderColor: border,
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <Box component="thead">
                <Box component="tr" sx={{ backgroundColor: surfaceMuted, borderBottom: `1px solid ${border}` }}>
                  <Box component="th" sx={{ textAlign: 'left', p: 1.75, color: textMuted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Security Layer</Box>
                  <Box component="th" sx={{ textAlign: 'left', p: 1.75, color: textMuted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Focus Area</Box>
                  <Box component="th" sx={{ textAlign: 'left', p: 1.75, color: textMuted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Monitors AI Tool Manifests?</Box>
                  <Box component="th" sx={{ textAlign: 'left', p: 1.75, color: textMuted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Zero-Trust Baseline?</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {[
                  { name: 'SAST (Snyk / SonarQube)', focus: 'Source code syntax vulnerabilities', monitors: '❌ Blind to tool configs', baseline: '❌ No' },
                  { name: 'Secret Scanners (TruffleHog)', focus: 'Hardcoded API keys & credentials', monitors: '❌ Ignores permission drift', baseline: '❌ No' },
                  { name: 'Endpoint EDR / Antivirus', focus: 'OS process behavior post-execution', monitors: '❌ Only reacts after breach', baseline: '❌ No' },
                  { name: 'ToolGuard', focus: 'AI tool capabilities & execution boundaries', monitors: '✅ Universal (MCP, NPM, VS Code, Agents)', baseline: '✅ Immutable SHA-256' },
                ].map((row, idx) => {
                  const isTg = row.name === 'ToolGuard';
                  return (
                    <Box
                      component="tr"
                      key={row.name}
                      sx={{
                        backgroundColor: isTg ? (isDark ? 'rgba(0, 212, 170, 0.05)' : 'rgba(0, 139, 114, 0.04)') : 'transparent',
                        borderBottom: idx < 3 ? `1px solid ${border}` : 'none'
                      }}
                    >
                      <Box component="td" sx={{ p: 1.75, fontWeight: isTg ? 750 : 600, color: isTg ? accent : 'text.primary' }}>
                        {row.name}
                      </Box>
                      <Box component="td" sx={{ p: 1.75, color: textMuted }}>{row.focus}</Box>
                      <Box component="td" sx={{ p: 1.75, color: isTg ? accent : danger, fontWeight: isTg ? 700 : 500 }}>{row.monitors}</Box>
                      <Box component="td" sx={{ p: 1.75, color: isTg ? accent : textMuted, fontWeight: isTg ? 700 : 500 }}>{row.baseline}</Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ── SECTION 4: CALL TO ACTION FOOTER ─────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3.5, sm: 5 },
          borderRadius: '12px',
          backgroundColor: surface,
          borderColor: border,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
          Ready to protect your AI developer environment?
        </Typography>
        <Typography variant="body2" sx={{ color: textMuted, maxWidth: 540, mx: 'auto', mb: 3 }}>
          Open the live console, run the 1-line terminal quickstart, or simulate a capability drift attack to see ToolGuard in action.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: '7px',
              px: 3,
              py: 0.9,
              backgroundColor: isDark ? '#10b981' : '#059669',
              color: '#ffffff',
              '&:hover': { backgroundColor: isDark ? '#059669' : '#047857' }
            }}
          >
            Open Live Console
          </Button>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => navigate('/integrations')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '7px',
              px: 2.5,
              py: 0.9,
              borderColor: border,
              color: 'text.primary',
            }}
          >
            Integration Guides
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
