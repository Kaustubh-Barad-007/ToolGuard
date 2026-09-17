import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DriftEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { driftEvents, acceptDriftEvent, triggerScan, loadJudgeDemo } = useDemoData();
  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; toolId: string } | null>(null);

  const filteredEvents = driftEvents.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'high') return e.severity === 'high' && e.status === 'open';
    if (filter === 'review') return e.severity === 'medium' && e.status === 'open';
    if (filter === 'resolved') return e.status === 'accepted' || e.status === 'resolved';
    return true;
  });

  const pageSize = 5;
  const pageCount = Math.ceil(filteredEvents.length / pageSize) || 1;
  const displayedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const handleConfirmAccept = () => {
    if (selectedEvent) {
      acceptDriftEvent(selectedEvent.eventId, selectedEvent.toolId);
      setSelectedEvent(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Trust Drift Events
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Inspect and resolve discrepancies between monitored tools and active baselines.
        </Typography>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={(_, val) => { setFilter(val); setPage(1); }}>
          <Tab label={`All (${driftEvents.length})`} value="all" />
          <Tab
            label={`High Risk (${driftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`}
            value="high"
          />
          <Tab
            label={`Review (${driftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`}
            value="review"
          />
          <Tab
            label={`Resolved (${driftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`}
            value="resolved"
          />
        </Tabs>
      </Box>

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EmptyState
            title="No Trust Drift Detected (SAFE)"
            description="All monitored tools match their cryptographic baseline. No unauthorized capability expansion detected."
            actionText="Run Scan Now"
            onAction={triggerScan}
          />
          <Button
            variant="contained"
            startIcon={<BoltIcon />}
            onClick={loadJudgeDemo}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              fontWeight: 750,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              boxShadow: '0 3px 12px rgba(245, 158, 11, 0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
            }}
          >
            ⚡ Test Evaluation Flow (Hackathon Judge Demo)
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {displayedEvents.map(event => (
            <Paper
              key={event.eventId}
              variant="outlined"
              sx={{
                p: 2.5,
                borderColor: event.status === 'open' && event.severity === 'high'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'divider',
                borderRadius: 1.5,
                transition: 'border-color 0.15s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'text.primary' }}>
                    {event.toolName}
                  </Typography>
                  <StatusBadge status={event.severity} />
                  {event.status !== 'open' && (
                    <Chip
                      label={event.status.toUpperCase()}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Detected: {new Date(event.detectedAt).toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Changes Summary */}
              <Box sx={{ mb: 2 }}>
                {event.changes.map((ch, idx) => (
                  <Box key={idx} sx={{ p: 1.5, mb: 1, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Property: <span style={{ fontFamily: 'monospace', color: 'inherit', fontWeight: 600 }}>{ch.path}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, mt: 0.25 }}>
                      {ch.reason}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Actions Bar */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/tools/${event.toolId}`)}
                  sx={{ borderColor: 'divider', color: 'text.primary' }}
                >
                  Review Details & Diff
                </Button>
                {event.status === 'open' && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                  >
                    Accept Change
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={pageCount} page={page} onChange={(_, val) => setPage(val)} color="primary" />
        </Box>
      )}

      {/* Accept Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(selectedEvent)}
        title="Accept this tool configuration?"
        description="This will update the trusted baseline to include the new capability and resolve the open drift event. A record of this action will be written to the audit log."
        confirmText="Confirm & Update"
        onConfirm={handleConfirmAccept}
        onCancel={() => setSelectedEvent(null)}
      />
    </Box>
  );
};
