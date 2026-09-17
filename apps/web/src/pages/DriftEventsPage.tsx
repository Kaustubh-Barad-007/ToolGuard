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
  Collapse,
  useTheme
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DiffViewer } from '../components/DiffViewer';

export const DriftEventsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { driftEvents, acceptDriftEvent, triggerScan, loadJudgeDemo, baseline, tools } = useDemoData();
  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; toolId: string } | null>(null);
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});

  const border = isDark ? '#1f2937' : '#e2e8f0';
  const surface = isDark ? '#111827' : '#ffffff';
  const codeBg = isDark ? '#0b0f19' : '#f8fafc';

  const toggleDiff = (eventId: string) => {
    setExpandedDiffs(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const filteredEvents = driftEvents.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'high') return e.severity === 'high' && e.status === 'open';
    if (filter === 'review') return e.severity === 'medium' && e.status === 'open';
    if (filter === 'resolved') return e.status === 'accepted' || e.status === 'resolved';
    return true;
  });

  const PAGE_SIZE = 5;
  const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE) || 1;
  const displayed = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ maxWidth: 960 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Trust Drift Events
            </Typography>
            <Chip
              label={`${driftEvents.filter(e => e.status === 'open').length} OPEN`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: driftEvents.some(e => e.status === 'open') ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: driftEvents.some(e => e.status === 'open') ? '#f43f5e' : '#10b981',
                border: `1px solid ${driftEvents.some(e => e.status === 'open') ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Zero-trust verification comparing active runtime tool capabilities against frozen SHA-256 baselines.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />}
          onClick={loadJudgeDemo}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            background: '#f59e0b',
            color: '#fff',
            '&:hover': { background: '#d97706' },
            boxShadow: 'none'
          }}
        >
          ⚡ Simulate Drift Demo
        </Button>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 2.5 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => { setFilter(v); setPage(1); }}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': { minHeight: 38, fontSize: '0.82rem', textTransform: 'none', fontWeight: 600, py: 0.75 },
            '& .Mui-selected': { color: '#10b981' },
            '& .MuiTabs-indicator': { backgroundColor: '#10b981' }
          }}
        >
          <Tab label={`All (${driftEvents.length})`} value="all" />
          <Tab label={`High Risk (${driftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`} value="high" />
          <Tab label={`Review (${driftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`} value="review" />
          <Tab label={`Resolved (${driftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`} value="resolved" />
        </Tabs>
      </Box>

      {/* Empty state */}
      {displayed.length === 0 && (
        <Paper variant="outlined" sx={{ textAlign: 'center', py: 6, px: 3, borderRadius: 2, borderColor: border, backgroundColor: surface }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Cryptographic Baseline Intact
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
            All monitored tools strictly match their authorized SHA-256 fingerprint. No unauthorized capability expansions detected.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button variant="outlined" size="small" onClick={triggerScan} sx={{ textTransform: 'none', borderRadius: '6px', borderColor: border, color: 'text.primary' }}>
              Run Verification Scan
            </Button>
            <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />} onClick={loadJudgeDemo}
              sx={{ textTransform: 'none', borderRadius: '6px', background: '#f59e0b', color: '#fff', fontWeight: 600, '&:hover': { background: '#d97706' }, boxShadow: 'none' }}>
              Test Evaluation Flow
            </Button>
          </Box>
        </Paper>
      )}

      {/* Events list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {displayed.map(event => {
          const isExpanded = Boolean(expandedDiffs[event.eventId]);
          const currentTool = tools.find(t => t.id === event.toolId || t.name === event.toolName);
          const baselineTool = baseline?.tools?.[event.toolId]?.normalizedDefinition || {
            name: event.toolName,
            status: 'baseline_not_found'
          };

          return (
            <Paper
              key={event.eventId}
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: surface,
                borderColor: event.status === 'open' && event.severity === 'high' ? 'rgba(244, 63, 94, 0.35)' : border,
                borderLeft: event.status === 'open' ? `4px solid ${event.severity === 'high' ? '#f43f5e' : '#f59e0b'}` : `4px solid #10b981`
              }}
            >
              {/* Event header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.95rem', color: 'text.primary' }}>
                    {event.toolName}
                  </Typography>
                  <StatusBadge status={event.severity} />
                  {event.status !== 'open' && (
                    <Chip label="RESOLVED" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '4px' }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Detected at {new Date(event.detectedAt).toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Changes */}
              <Box sx={{ mb: 2 }}>
                {event.changes.map((ch, idx) => (
                  <Box key={idx} sx={{ p: 1.5, mb: 1, backgroundColor: codeBg, borderRadius: 1.5, border: `1px solid ${border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        PROPERTY DRIFT: <code style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 700 }}>{ch.path}</code>
                      </Typography>
                      <Chip label={ch.type.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 550, mb: 0.25 }}>
                      {ch.reason}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
                      <strong>Impact:</strong> {ch.whyItMatters}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Expandable Code Diff */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mb: 2 }}>
                <Box sx={{ mt: 1.5 }}>
                  <DiffViewer
                    baselineJson={baselineTool}
                    currentJson={currentTool || { name: event.toolName, note: 'Current manifest changed' }}
                    baselineTitle={`BASELINE DEFINITION (SHA-256)`}
                    currentTitle={`CURRENT DETECTED STATE (${event.toolName})`}
                  />
                </Box>
              </Collapse>

              {/* Actions toolbar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${border}`, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CodeIcon sx={{ fontSize: '15px !important' }} />}
                  endIcon={isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: '16px !important' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: '16px !important' }} />}
                  onClick={() => toggleDiff(event.eventId)}
                  sx={{ textTransform: 'none', fontSize: '0.78rem', color: 'text.secondary', fontWeight: 600 }}
                >
                  {isExpanded ? 'Hide Raw Diff' : 'Inspect Raw Diff'}
                </Button>

                {event.status === 'open' && (
                  <Button
                    size="small"
                    onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '6px', px: 2 }}
                  >
                    Accept & Freeze New Baseline
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small" />
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(selectedEvent)}
        title="Accept & Freeze New Baseline?"
        description="This establishes a new cryptographic SHA-256 baseline including the reviewed capability changes and marks the trust drift as resolved."
        confirmText="Confirm & Freeze Baseline"
        onConfirm={() => {
          if (selectedEvent) {
            acceptDriftEvent(selectedEvent.eventId, selectedEvent.toolId);
            setSelectedEvent(null);
          }
        }}
        onCancel={() => setSelectedEvent(null)}
      />
    </Box>
  );
};
