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
    <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em' }}>
              Trust Drift Events
            </Typography>
            <Chip
              label={`${driftEvents.filter(e => e.status === 'open').length} OPEN`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.67rem',
                fontWeight: 750,
                backgroundColor: driftEvents.some(e => e.status === 'open') ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: driftEvents.some(e => e.status === 'open') ? '#be123c' : '#047857',
                border: `1px solid ${driftEvents.some(e => e.status === 'open') ? 'rgba(244, 63, 94, 0.28)' : 'rgba(16, 185, 129, 0.28)'}`,
                borderRadius: '6px'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
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
            fontWeight: 750,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            px: 2,
            py: 0.8,
            '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
          }}
        >
          ⚡ Simulate Drift Demo
        </Button>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => { setFilter(v); setPage(1); }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.84rem',
              textTransform: 'none',
              fontWeight: 650,
              py: 0.75,
              color: 'text.secondary',
              '&.Mui-selected': { color: isDark ? '#10b981' : '#059669', fontWeight: 750 }
            },
            '& .MuiTabs-indicator': { backgroundColor: isDark ? '#10b981' : '#059669', height: 2.5, borderRadius: 1 }
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
        <Paper variant="outlined" sx={{ textAlign: 'center', py: 7, px: 3, borderRadius: '12px', borderColor: border, backgroundColor: surface, boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 6px 18px -3px rgba(15,23,42,0.04)' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            Cryptographic Baseline Intact
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
            All monitored tools strictly match their authorized SHA-256 fingerprint. No unauthorized capability expansions detected.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button variant="outlined" size="small" onClick={triggerScan} sx={{ textTransform: 'none', borderRadius: '8px', borderColor: border, color: 'text.primary', fontWeight: 650, px: 2.2 }}>
              Run Verification Scan
            </Button>
            <Button variant="contained" size="small" startIcon={<BoltIcon sx={{ fontSize: '15px !important' }} />} onClick={loadJudgeDemo}
              sx={{ textTransform: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 700, px: 2.2, boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}>
              Test Evaluation Flow
            </Button>
          </Box>
        </Paper>
      )}

      {/* Events list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3.5 }}>
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
                borderRadius: '12px',
                backgroundColor: surface,
                borderColor: event.status === 'open' && event.severity === 'high' ? 'rgba(244, 63, 94, 0.35)' : border,
                borderLeft: event.status === 'open' ? `4px solid ${event.severity === 'high' ? '#e11d48' : '#d97706'}` : `4px solid #059669`,
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 14px -2px rgba(15,23,42,0.04)',
                transition: 'all 0.18s ease'
              }}
            >
              {/* Event header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.96rem', color: 'text.primary' }}>
                    {event.toolName}
                  </Typography>
                  <StatusBadge status={event.severity} />
                  {event.status !== 'open' && (
                    <Chip label="RESOLVED" size="small" sx={{ height: 21, fontSize: '0.66rem', fontWeight: 750, backgroundColor: 'rgba(16,185,129,0.1)', color: '#047857', borderRadius: '5px' }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Detected at {new Date(event.detectedAt).toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Changes */}
              <Box sx={{ mb: 2 }}>
                {event.changes.map((ch, idx) => (
                  <Box key={idx} sx={{ p: 1.8, mb: 1.25, backgroundColor: codeBg, borderRadius: '8px', border: `1px solid ${border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750, letterSpacing: '0.03em' }}>
                        PROPERTY DRIFT: <code style={{ color: isDark ? '#60a5fa' : '#0284c7', fontWeight: 750, background: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(2,132,199,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{ch.path}</code>
                      </Typography>
                      <Chip label={ch.type.toUpperCase()} size="small" sx={{ height: 19, fontSize: '0.63rem', fontWeight: 750, borderRadius: '4px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 650, mb: 0.5 }}>
                      {ch.reason}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.55 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.25, borderTop: `1px solid ${border}`, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CodeIcon sx={{ fontSize: '15px !important' }} />}
                  endIcon={isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: '16px !important' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: '16px !important' }} />}
                  onClick={() => toggleDiff(event.eventId)}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', color: 'text.secondary', fontWeight: 650, '&:hover': { color: 'text.primary' } }}
                >
                  {isExpanded ? 'Hide Raw Diff' : 'Inspect Raw Diff'}
                </Button>

                {event.status === 'open' && (
                  <Button
                    size="small"
                    onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', px: 2.2, py: 0.6 }}
                  >
                    Accept &amp; Freeze New Baseline
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
