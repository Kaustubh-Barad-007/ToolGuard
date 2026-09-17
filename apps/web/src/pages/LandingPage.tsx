import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../context/ThemeModeContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary' }}>
      {/* Navbar */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2, px: { xs: 2, md: 6 } }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldIcon sx={{ color: '#10b981', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 750, letterSpacing: '-0.02em', color: 'text.primary' }}>
              ToolGuard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
                {isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Button color="inherit" onClick={() => navigate('/docs')}>Documentation</Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
              Open Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Chip
          label="DEVELOPER SECURITY TOOLING"
          size="small"
          sx={{ mb: 3, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}
        />
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2.5, letterSpacing: '-0.03em', fontSize: { xs: '2.2rem', md: '3.4rem' } }}>
          You trusted the tool.<br />Did the tool stay the same?
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 4, maxWidth: 620, mx: 'auto', lineHeight: 1.6 }}>
          ToolGuard establishes a trusted baseline of your developer and AI tool definitions, continuously detecting capability and permission drift before it reaches runtime.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ px: 3.5, py: 1.25, fontSize: '0.95rem' }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/docs')}
            sx={{ px: 3, py: 1.25, borderColor: 'divider', color: 'text.primary' }}
          >
            View Documentation
          </Button>
        </Box>
      </Container>

      {/* Trust Workflow Diagram */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 650, letterSpacing: '0.08em', display: 'block', mb: 3, textAlign: 'center' }}>
            HOW IT WORKS — GIT FOR TOOL TRUST
          </Typography>

          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {[
              { step: '01', title: 'Discover', desc: 'Auto-detects tool manifests, MCP configs, and local tools.' },
              { step: '02', title: 'Freeze Baseline', desc: 'Normalizes and generates deterministic SHA-256 fingerprints.' },
              { step: '03', title: 'Detect Drift', desc: 'Monitors permissions, endpoints, execution, and schema shifts.' },
              { step: '04', title: 'Explain & Decide', desc: 'Transparent rule-based risk analysis: accept or restore.' }
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.step}>
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>
                    {item.step}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 650, mt: 0.5, mb: 1, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Example Trust Drift Scenario */}
      <Container maxWidth="md" sx={{ pb: 12 }}>
        <Typography variant="h4" sx={{ fontWeight: 750, textAlign: 'center', mb: 1.5, color: 'text.primary' }}>
          Transparent, Explainable Security
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 5, maxWidth: 540, mx: 'auto' }}>
          No arbitrary 82/100 black-box scores. Every drift alert identifies the exact changed property and explains why it matters.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#ef4444' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 650, color: 'text.primary' }}>
                project-files — Trust Drift Detected
              </Typography>
            </Box>
            <Chip label="HIGH RISK" size="small" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>BASELINE</Typography>
                <Typography component="pre" sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', mt: 1, color: 'text.primary' }}>
                  permissions: ["read"]
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 1, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>CURRENT</Typography>
                <Typography component="pre" sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', mt: 1, color: '#ef4444' }}>
                  permissions: ["read", "write"]
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ p: 2, backgroundColor: isDark ? '#161b22' : '#f8fafc', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
              WHY THIS MATTERS
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, lineHeight: 1.6 }}>
              Write capability was added to a previously read-only tool. Baseline previously allowed read access only. This requires review because the tool's ability to modify project data has increased.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
