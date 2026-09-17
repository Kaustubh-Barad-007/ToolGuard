import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  Pagination,
  useTheme
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DriftEventsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { driftEvents, acceptDriftEvent, triggerScan, loadJudgeDemo } = useDemoData();
  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; toolId: string } | null>(null);

  const border  = isDark ? '#30363d' : '#d0d7de';
  const surface = isDark ? '#161b22' : '#ffffff';
  const codeBg  = isDark ? '#0d1117' : '#f6f8fa';

  const filteredEvents = driftEvents.filter(e => {
    if (filter === 'all')      return true;
    if (filter === 'high')     return e.severity === 'high' && e.status === 'open';
    if (filter === 'review')   return e.severity === 'medium' && e.status === 'open';
    if (filter === 'resolved') return e.status === 'accepted' || e.status === 'resolved';
    return true;
  });

  const PAGE_SIZE = 5;
  const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE) || 1;
  const displayed = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
          Trust Drift Events
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Inspect tool modifications against the cryptographic baseline.
        </Typography>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 2.5 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => { setFilter(v); setPage(1); }}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, fontSize: '0.82rem', textTransform: 'none', fontWeight: 500, py: 0.75 },
            '& .Mui-selected': { fontWeight: 600 },
          }}
        >
          <Tab label={`All (${driftEvents.length})`} value="all" />
          <Tab label={`High risk (${driftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`} value="high" />
          <Tab label={`Review (${driftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`} value="review" />
          <Tab label={`Resolved (${driftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`} value="resolved" />
        </Tabs>
      </Box>

      {/* Empty state */}
      {displayed.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>All clear — no drift detected</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>All monitored tools match their cryptographic baseline.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button variant="outlined" size="small" onClick={triggerScan} sx={{ textTransform: 'none', borderRadius: '6px', borderColor: border, color: 'text.secondary' }}>
              Run scan
            </Button>
            <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '14px !important' }} />} onClick={loadJudgeDemo}
              sx={{ textTransform: 'none', borderRadius: '6px', background: '#f59e0b', color: '#fff', fontWeight: 600, '&:hover': { background: '#d97706' }, boxShadow: 'none' }}>
              Try demo
            </Button>
          </Box>
        </Box>
      )}

      {/* Events list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {displayed.map(event => (
          <Paper
            key={event.eventId}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: '8px',
              backgroundColor: surface,
              borderColor: event.status === 'open' && event.severity === 'high' ? 'rgba(239,68,68,0.4)' : border,
            }}
          >
            {/* Event header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem', color: 'text.primary' }}>
                  {event.toolName}
                </Typography>
                <StatusBadge status={event.severity} />
                {event.status !== 'open' && (
                  <Chip label={event.status} size="small" sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '4px' }} />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {new Date(event.detectedAt).toLocaleTimeString()}
              </Typography>
            </Box>

            {/* Changes */}
            <Box sx={{ mb: 1.5 }}>
              {event.changes.map((ch, idx) => (
                <Box key={idx} sx={{ p: 1.25, mb: 0.75, backgroundColor: codeBg, borderRadius: '6px', border: `1px solid ${border}` }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    <code style={{ color: 'inherit' }}>{ch.path}</code>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.25, fontSize: '0.82rem' }}>{ch.reason}</Typography>
                </Box>
              ))}
            </Box>

            {/* Actions */}
            {event.status === 'open' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button size="small" onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                  variant="contained" color="primary"
                  sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, borderRadius: '6px', boxShadow: 'none' }}>
                  Accept & update baseline
                </Button>
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small" />
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(selectedEvent)}
        title="Accept this configuration?"
        description="Updates the trusted baseline with the new capability and resolves the drift event."
        confirmText="Confirm & update"
        onConfirm={() => { if (selectedEvent) { acceptDriftEvent(selectedEvent.eventId, selectedEvent.toolId); setSelectedEvent(null); } }}
        onCancel={() => setSelectedEvent(null)}
      />
    </Box>
  );
};
