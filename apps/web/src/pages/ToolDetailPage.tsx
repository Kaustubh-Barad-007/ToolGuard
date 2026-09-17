import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { DiffViewer } from '../components/DiffViewer';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ToolDetailPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { tools, baseline, scanStatuses, driftEvents, acceptDriftEvent } = useDemoData();
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);

  const tool = tools.find(t => t.id === toolId || t.name === toolId);
  const scanStatus = scanStatuses.find(s => s.toolId === toolId || s.name === toolId);
  const baselineEntry = baseline.tools[toolId || ''] || (tool ? baseline.tools[tool.name] : undefined);
  const driftEvent = driftEvents.find(e => (e.toolId === toolId || e.toolName === toolId) && e.status === 'open');

  if (!tool) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2 }}>
          Tool not found
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleAcceptConfirm = () => {
    if (driftEvent) {
      acceptDriftEvent(driftEvent.eventId, tool.id || tool.name);
    }
    setConfirmAcceptOpen(false);
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5, color: '#8b949e', fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/tools')}>
          Tools
        </Link>
        <Typography color="text.primary" sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          {tool.name}
        </Typography>
      </Breadcrumbs>

      {/* Tool Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'text.primary' }}>
              {tool.name}
            </Typography>
            {scanStatus && <StatusBadge status={scanStatus.status} />}
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {tool.description || 'No description provided'}
          </Typography>
        </Box>

        {driftEvent && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setConfirmAcceptOpen(true)}
            sx={{ px: 2.5 }}
          >
            Accept Change
          </Button>
        )}
      </Box>

      {/* Metadata Overview Card */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 4, borderColor: 'divider', borderRadius: 1.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              ENDPOINT
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace', color: 'text.primary', mt: 0.5 }}>
              {tool.endpoint || 'local'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              PERMISSIONS
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {tool.permissions && tool.permissions.length > 0 ? (
                tool.permissions.map(p => (
                  <Chip key={p} label={p} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>none</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              BASELINE VERSION
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
              v{baseline.version} ({new Date(baseline.createdAt).toLocaleDateString()})
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              EXECUTION
            </Typography>
            <Typography variant="body2" sx={{ color: tool.execution?.enabled ? '#f59e0b' : '#10b981', fontWeight: 600, mt: 0.5 }}>
              {tool.execution?.enabled ? 'Enabled' : 'Disabled (Safe)'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Why This Matters / Security Explanation Section */}
      {scanStatus?.driftDetected && scanStatus.changes.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {scanStatus.changes.map((change, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 3,
                mb: 2,
                backgroundColor: change.severity === 'high' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                borderColor: change.severity === 'high' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                borderRadius: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: change.severity === 'high' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                    RULE: {change.ruleId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    at property <span style={{ fontFamily: 'monospace', color: 'inherit', fontWeight: 600 }}>{change.path}</span>
                  </Typography>
                </Box>
                <StatusBadge status={change.severity} />
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                {change.reason}
              </Typography>

              <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                  WHY THIS MATTERS
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {change.whyItMatters}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Structural Diff Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1.5 }}>
          Tool Definition Comparison
        </Typography>
        <DiffViewer
          baselineJson={baselineEntry?.normalizedDefinition || {}}
          currentJson={tool}
          baselineTitle={`BASELINE (v${baseline.version})`}
          currentTitle="CURRENT DEFINITION"
        />
      </Box>

      {/* Confirmation Dialog for Accepting Drift */}
      <ConfirmDialog
        open={confirmAcceptOpen}
        title="Accept this new configuration?"
        description="This will update the trusted state for this tool and record a new baseline version. The current baseline will be permanently preserved in the audit history."
        confirmText="Accept & Update Baseline"
        confirmColor="primary"
        onConfirm={handleAcceptConfirm}
        onCancel={() => setConfirmAcceptOpen(false)}
      />
    </Box>
  );
};
