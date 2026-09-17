import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SECTIONS = [
  { id: 'overview', title: 'Product Overview' },
  { id: 'cli', title: 'CLI Reference' },
  { id: 'vscode', title: 'VS Code Extension' },
  { id: 'risk-rules', title: 'Risk Engine & Rules' },
  { id: 'ci-cd', title: 'CI/CD Pipelines' },
  { id: 'privacy', title: 'Data Privacy & Redaction' },
  { id: 'limitations', title: 'Security Limitations' }
];

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          ToolGuard Documentation
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Reference guide for developer tool trust baselines, drift detection, and CI integration.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Navigation index */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 1, borderColor: 'divider', borderRadius: 1.5, position: 'sticky', top: 80 }}>
            <List dense>
              {SECTIONS.map(s => (
                <ListItem key={s.id} disablePadding>
                  <ListItemButton
                    selected={activeSection === s.id}
                    onClick={() => setActiveSection(s.id)}
                    sx={{
                      borderRadius: 1,
                      color: activeSection === s.id ? 'primary.main' : 'text.secondary',
                      backgroundColor: activeSection === s.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                    }}
                  >
                    <ListItemText primary={s.title} primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: activeSection === s.id ? 600 : 500 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content Section */}
        <Grid item xs={12} md={9}>
          <Paper variant="outlined" sx={{ p: 4, borderColor: 'divider', borderRadius: 1.5 }}>
            {activeSection === 'overview' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  Product Overview
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                  ToolGuard addresses the emerging security threat of <strong>Trust Drift</strong> in modern developer and AI tool environments. When you configure an AI agent, Model Context Protocol (MCP) server, or development tool manifest, you establish a trusted expectation of what that tool can access.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                  ToolGuard acts as <em>"Git for tool trust"</em>: it freezes your verified tool definitions into a canonical baseline with cryptographic SHA-256 fingerprints. Any subsequent modifications (e.g. newly granted write access, command execution, or redirected endpoints) are instantly flagged and explained before execution.
                </Typography>
              </Box>
            )}

            {activeSection === 'cli' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  CLI Command Reference
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  ToolGuard provides a full-featured terminal CLI for local inspection and automated CI/CD gating.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontFamily: 'monospace', mb: 0.5 }}>
                    toolguard init
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Scans the current workspace, detects tool manifests and MCP configurations, and prompts to create the initial trusted baseline.
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontFamily: 'monospace', mb: 0.5 }}>
                    toolguard scan [--ci] [--fail-on &lt;severity&gt;]
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Compares workspace tools against the trusted baseline. Returns exit code 0 if clean, 1 if drift detected, or 2 if an error occurred.
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontFamily: 'monospace', mb: 0.5 }}>
                    toolguard explain &lt;toolName&gt;
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Outputs a human-readable security explanation of why the detected change matters.
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontFamily: 'monospace', mb: 0.5 }}>
                    toolguard status
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Displays quick protection status and count of monitored tools.
                  </Typography>
                </Box>
              </Box>
            )}

            {activeSection === 'vscode' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  VS Code Extension
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                  The ToolGuard VS Code extension provides native status bar integration:
                </Typography>
                <Typography component="pre" sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#10b981', mb: 2 }}>
                  🛡 ToolGuard ✓  (Green: Protected)<br />
                  🛡 ToolGuard !  (Yellow/Red: Drift Detected)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Clicking the status bar item or running commands from the Command Palette (Ctrl+Shift+P) allows scanning, diff inspection, and baseline creation directly within the IDE without opening an external browser.
                </Typography>
              </Box>
            )}

            {activeSection === 'risk-rules' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  Risk Classification Engine
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                  All risk determinations are transparent and rule-based. Every alert includes a registered Rule ID, severity classification, and context-specific reasoning:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 700 }}>
                        CAPABILITY_WRITE_ADDED
                      </Typography>
                      <Chip label="HIGH RISK" size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Triggered when write capability is introduced to a previously read-only tool.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 700 }}>
                        CAPABILITY_EXECUTION_ADDED
                      </Typography>
                      <Chip label="HIGH RISK" size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Triggered when process or shell execution capability is granted to a tool.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                        DESCRIPTION_CHANGED
                      </Typography>
                      <Chip label="REVIEW" size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Triggered when tool prompt text changes, which may alter how an LLM agent invokes the tool.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {activeSection === 'ci-cd' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  CI/CD Pipelines
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                  Embed ToolGuard in GitHub Actions to block pull requests that modify tool definitions without updating the baseline:
                </Typography>
                <Box component="pre" sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'text.primary', overflowX: 'auto' }}>
{`- name: ToolGuard Security Gate
  run: toolguard scan --ci --fail-on high`}
                </Box>
              </Box>
            )}

            {activeSection === 'privacy' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  Data Privacy & Secret Redaction
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                  ToolGuard operates on the principle of minimal necessary data:
                </Typography>
                <Box component="ul" sx={{ color: 'text.secondary', pl: 3, lineHeight: 1.8 }}>
                  <li>We never upload source code, project files, or repository contents.</li>
                  <li>Common credential properties (API keys, bearer tokens, passwords) are automatically detected and replaced with <code>[REDACTED]</code> before baseline generation or cloud synchronization.</li>
                  <li>Local scanning can operate completely offline without requiring cloud accounts.</li>
                </Box>
              </Box>
            )}

            {activeSection === 'limitations' && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                  Security Limitations & Scope
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                  ToolGuard's primary responsibility is <strong>detecting unexpected changes in trusted tool configurations</strong>.
                </Typography>
                <Box component="ul" sx={{ color: 'text.secondary', pl: 3, lineHeight: 1.8 }}>
                  <li>ToolGuard does not guarantee that an initial tool is safe; it verifies that the tool has not drifted from what you trusted.</li>
                  <li>It does not replace runtime sandboxing, endpoint protection (EDR), or manual code reviews.</li>
                  <li>Heuristic redaction may not catch unlabelled secrets buried in opaque text blobs.</li>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
