import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import { useDemoData } from '../context/DemoDataContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const BaselinesPage: React.FC = () => {
  const { baseline, createNewBaseline } = useDemoData();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);

  const handleCreateConfirm = () => {
    createNewBaseline();
    setCreateDialogOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(baseline, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(baseline, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baseline-v${baseline.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toolsList = Object.values(baseline.tools);

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', mb: 0.5 }}>
            Trusted Baselines
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Cryptographically signed reference points defining the authorized capabilities of your tools.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ borderColor: 'divider', color: 'text.primary' }}
          >
            Export JSON
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Baseline
          </Button>
        </Box>
      </Box>

      {/* Active Baseline Summary Card */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LayersOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Active Baseline (Version {baseline.version})
            </Typography>
            <Chip
              label="ACTIVE & SIGNED"
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace' }}>
            ID: {baseline.baselineId}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>FROZEN TIMESTAMP</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 500 }}>
              {new Date(baseline.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>AUTHORIZED BY</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 500 }}>
              {baseline.createdBy}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>HASH ALGORITHM</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontFamily: 'monospace' }}>
              {baseline.algorithm} (Deterministic)
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>FROZEN TOOL COUNT</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 700 }}>
              {baseline.toolCount} tools registered
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tools / Raw JSON Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs value={viewMode} onChange={(_, val) => setViewMode(val)} sx={{ minHeight: 32 }}>
          <Tab label="Frozen Tools Table" value="table" sx={{ minHeight: 32, py: 0 }} />
          <Tab label="Raw Canonical JSON" value="json" sx={{ minHeight: 32, py: 0 }} />
        </Tabs>

        {viewMode === 'json' && (
          <Tooltip title={copied ? 'Copied!' : 'Copy Baseline JSON'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary' }}>
              {copied ? <CheckIcon fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {viewMode === 'table' ? (
        <Paper variant="outlined" sx={{ borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>TOOL</TableCell>
                <TableCell>FROZEN PERMISSIONS</TableCell>
                <TableCell>ENDPOINT</TableCell>
                <TableCell>CANONICAL SHA-256 DIGEST</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {toolsList.map(item => (
                <TableRow key={item.toolId} hover>
                  <TableCell sx={{ fontWeight: 650, color: 'text.primary', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {item.normalizedDefinition.permissions.length > 0 ? (
                        item.normalizedDefinition.permissions.map(p => (
                          <Chip key={p} label={p} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>none</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                    {item.normalizedDefinition.endpoint || 'local'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                    {item.fingerprint.substring(0, 16)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', borderColor: 'divider', borderRadius: 2 }}>
          <Box component="pre" sx={{ m: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', lineHeight: 1.6, color: 'text.primary', overflowX: 'auto' }}>
            {JSON.stringify(baseline, null, 2)}
          </Box>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={createDialogOpen}
        title="Create trusted baseline?"
        description="This will record the current tool configuration as the expected trusted state. All future scans will compare against this new baseline."
        confirmText="Create Baseline"
        onConfirm={handleCreateConfirm}
        onCancel={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};
