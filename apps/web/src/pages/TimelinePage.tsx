import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import { useDemoData } from '../context/DemoDataContext';
import { AuditActionType } from '@toolguard/shared';

function getActionIcon(action: AuditActionType) {
  switch (action) {
    case 'BASELINE_CREATED':
    case 'BASELINE_UPDATED':
      return <LayersOutlinedIcon sx={{ color: '#3b82f6', fontSize: 18 }} />;
    case 'DRIFT_DETECTED':
      return <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 18 }} />;
    case 'CHANGE_ACCEPTED':
      return <DoneAllIcon sx={{ color: '#10b981', fontSize: 18 }} />;
    case 'SCAN_COMPLETED':
    default:
      return <CheckCircleOutlineIcon sx={{ color: '#8b949e', fontSize: 18 }} />;
  }
}

export const TimelinePage: React.FC = () => {
  const { auditLogs } = useDemoData();
  const [filter, setFilter] = useState<'all' | 'drift' | 'baseline' | 'accepted'>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'drift') return log.action === 'DRIFT_DETECTED';
    if (filter === 'baseline') return log.action === 'BASELINE_CREATED' || log.action === 'BASELINE_UPDATED';
    if (filter === 'accepted') return log.action === 'CHANGE_ACCEPTED';
    return true;
  });

  const exportAuditLog = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolguard-audit-trail-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: 960 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 750, color: '#f8fafc', mb: 0.5 }}>
            Trust Timeline & Audit Ledger
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Tamper-evident, chronological log of all scan events, baseline updates, and accepted changes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportAuditLog}
          sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: '#cbd5e1' }}
        >
          Export Audit Trail
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', mb: 3.5 }}>
        <Tabs value={filter} onChange={(_, val) => setFilter(val)} sx={{ minHeight: 32 }}>
          <Tab label={`All Events (${auditLogs.length})`} value="all" sx={{ minHeight: 32, py: 0 }} />
          <Tab label="Drift Alerts" value="drift" sx={{ minHeight: 32, py: 0 }} />
          <Tab label="Baselines" value="baseline" sx={{ minHeight: 32, py: 0 }} />
          <Tab label="Accepted Changes" value="accepted" sx={{ minHeight: 32, py: 0 }} />
        </Tabs>
      </Box>

      {/* Timeline Stream */}
      <Box sx={{ position: 'relative', pl: 3.5, borderLeft: '2px solid rgba(255, 255, 255, 0.08)' }}>
        {filteredLogs.map((log) => (
          <Box key={log.auditId} sx={{ mb: 3, position: 'relative' }}>
            {/* Timeline node circle */}
            <Box
              sx={{
                position: 'absolute',
                left: -39,
                top: 2,
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0c101a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getActionIcon(log.action)}
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                backgroundColor: '#0e131f',
                borderColor: log.action === 'DRIFT_DETECTED'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : log.action === 'CHANGE_ACCEPTED'
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(255, 255, 255, 0.07)',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {log.action.replace(/_/g, ' ')}
                  </Typography>
                  <Chip
                    label={log.actorId}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#8b949e', fontSize: '0.78rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Metadata display */}
              <Box sx={{ p: 1.5, backgroundColor: '#080b11', borderRadius: 1.5, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <Typography component="pre" sx={{ m: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.76rem', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(log.metadata, null, 2)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
