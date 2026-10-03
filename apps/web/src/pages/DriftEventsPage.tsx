import React, { useState, useEffect } from 'react';
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
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDemoData } from '../context/DemoDataContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DiffViewer } from '../components/DiffViewer';
import { BaselineManager } from '@toolguard/core';
import { DriftEvent, ToolScanStatus } from '@toolguard/shared';

export const DriftEventsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    driftEvents,
    scanStatuses,
    acceptDriftEvent,
    resetToBaseline,
    triggerScan,
    baseline,
    tools,
    isVerifying,
  } = useDemoData();

  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; toolId: string } | null>(null);
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});
  const [isRestoring, setIsRestoring] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleRejectThreat = async () => {
    setIsRestoring(true);
    try {
      await resetToBaseline();
      setFeedback({
        message: '✓ Threat rejected! Workspace restored to trusted baseline (All tools verified SAFE).',
        severity: 'success'
      });
    } catch {
      setFeedback({
        message: 'Failed to restore baseline. Please retry.',
        severity: 'error'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const border    = isDark ? '#2E2E2E' : '#E5E7EB';
  const surface   = isDark ? '#1C1C1C' : '#FFFFFF';
  const surfaceBg = isDark ? '#171717' : '#F9FAFB';
  const accent    = isDark ? '#3ECF8E' : '#00C475';
  const danger    = isDark ? '#FA5252' : '#DC2626';
  const warning   = isDark ? '#F5A623' : '#D97706';
  const textMuted = isDark ? '#9E9E9E' : '#6B7280';

  const toggleDiff = (id: string) =>
    setExpandedDiffs(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));

  // Derive events from live scan statuses and cryptographic comparison
  const driftListFromScan = scanStatuses.filter(t => t.driftDetected);
  const driftListFromCompare = (tools.length > 0 && baseline && baseline.baselineId !== 'bl-empty')
    ? BaselineManager.compare(tools, baseline).tools.filter(t => t.driftDetected)
    : [];

  const activeDriftMap = new Map<string, ToolScanStatus>();
  for (const d of driftListFromScan) {
    activeDriftMap.set(d.toolId || d.name, d);
  }
  for (const d of driftListFromCompare) {
    activeDriftMap.set(d.toolId || d.name, d);
  }
  const activeDriftStatuses = Array.from(activeDriftMap.values());

  const eventsFromStatuses: DriftEvent[] = activeDriftStatuses.map(d => ({
    eventId: `drift-${d.toolId}`,
    projectId: baseline?.projectId || 'project',
    toolId: d.toolId,
    toolName: d.name,
    baselineId: baseline?.baselineId || 'bl',
    scanId: 'scan-live',
    detectedAt: d.lastChecked || new Date().toISOString(),
    status: 'open' as const,
    severity: d.status === 'HIGH RISK' ? 'high' as const : 'medium' as const,
    changes: d.changes || [],
  }));

  // Build drift events list cleanly - never suppress open drift events
  const mergedEventsMap = new Map<string, DriftEvent>();
  // 1. Add all events currently in context driftEvents
  for (const e of driftEvents) {
    mergedEventsMap.set(e.eventId || e.toolId || e.toolName, e);
  }
  // 2. Overlay live status events
  for (const e of eventsFromStatuses) {
    const key = e.toolId || e.toolName;
    const existing = Array.from(mergedEventsMap.values()).find(x => x.toolId === e.toolId || x.toolName === e.toolName);
    if (!existing) {
      mergedEventsMap.set(key, e);
    }
  }

  const allDriftEvents = Array.from(mergedEventsMap.values());
  const openCount = allDriftEvents.filter(e => e.status === 'open').length;

  // Auto-switch tab from 'resolved' to 'all' if a new open drift arrives
  useEffect(() => {
    if (openCount > 0 && filter === 'resolved') {
      setFilter('all');
    }
  }, [openCount, filter]);

  const filteredEvents = allDriftEvents.filter(e => {
    if (filter === 'all') return e.status === 'open';
    if (filter === 'high') return e.severity === 'high' && e.status === 'open';
    if (filter === 'review') return e.severity === 'medium' && e.status === 'open';
    if (filter === 'resolved') return e.status === 'accepted' || e.status === 'resolved';
    return true;
  });

  const PAGE_SIZE = 5;
  const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE) || 1;
  const displayed = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Relative time helper
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    return `${Math.floor(h / 24)} day(s) ago`;
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Drift Events
            </Typography>
            {openCount > 0 && (
              <Chip
                label={`${openCount} open`}
                size="small"
                sx={{
                  height: 22, fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                  backgroundColor: isDark ? 'rgba(250,82,82,0.12)' : 'rgba(220,38,38,0.08)',
                  color: danger,
                  border: `1px solid ${isDark ? 'rgba(250,82,82,0.3)' : 'rgba(220,38,38,0.25)'}`,
                }}
              />
            )}
            {openCount === 0 && (
              <Chip
                label="All clear"
                size="small"
                sx={{
                  height: 22, fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                  backgroundColor: isDark ? 'rgba(62,207,142,0.12)' : 'rgba(0,196,117,0.08)',
                  color: accent,
                  border: `1px solid ${isDark ? 'rgba(62,207,142,0.3)' : 'rgba(0,196,117,0.25)'}`,
                }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: textMuted }}>
            Unauthorized tool capability changes detected against trusted baseline signatures.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          disabled={isVerifying}
          startIcon={isVerifying ? <CircularProgress size={13} color="inherit" /> : null}
          onClick={triggerScan}
          sx={{
            textTransform: 'none', fontWeight: 700, fontSize: '0.84rem',
            borderRadius: '7px', px: 2, py: 0.75,
            backgroundColor: accent, color: isDark ? '#121212' : '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
          }}
        >
          {isVerifying ? 'Scanning…' : 'Run Verification Scan'}
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => { setFilter(v); setPage(1); }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40, fontSize: '0.82rem', textTransform: 'none',
              fontWeight: 500, py: 0.5, px: 1.75, color: textMuted,
              '&.Mui-selected': { color: 'text.primary', fontWeight: 600 },
            },
            '& .MuiTabs-indicator': { backgroundColor: accent, height: 2 },
          }}
        >
          <Tab label={`Active Drifts (${openCount})`} value="all" />
          <Tab label={`High Risk (${allDriftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`} value="high" />
          <Tab label={`Under Review (${allDriftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`} value="review" />
          <Tab label={`Resolved (${allDriftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`} value="resolved" />
        </Tabs>
      </Box>

      {/* Empty State */}
      {displayed.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ textAlign: 'center', py: 9, px: 3, borderRadius: '10px', borderColor: border, backgroundColor: surface }}
        >
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(62,207,142,0.1)' : 'rgba(0,196,117,0.08)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2,
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 28, color: accent }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.75, letterSpacing: '-0.01em' }}>
            No drift events detected
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, maxWidth: 400, mx: 'auto', mb: 3, lineHeight: 1.7 }}>
            All monitored tools match their trusted baseline signatures. Your workspace is secure.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={isVerifying}
            startIcon={isVerifying ? <CircularProgress size={13} /> : null}
            onClick={triggerScan}
            sx={{
              textTransform: 'none', borderRadius: '7px', fontWeight: 600,
              fontSize: '0.84rem', px: 2.5, py: 0.75,
              borderColor: border, color: textMuted,
              '&:hover': { borderColor: accent, color: accent },
            }}
          >
            {isVerifying ? 'Scanning…' : 'Run a fresh scan'}
          </Button>
        </Paper>
      )}

      {/* Events List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {displayed.map(event => {
          const isExpanded = expandedDiffs[event.eventId] ?? true;
          const currentTool = tools.find(t =>
            (t.id && t.id === event.toolId) || t.name === event.toolName
          );

          let baselineDefinition = baseline?.tools?.[event.toolId]?.normalizedDefinition;
          if (!baselineDefinition && baseline?.tools) {
            const entry = Object.values(baseline.tools).find(
              e => e.toolId === event.toolId || e.name === event.toolName
            );
            if (entry) baselineDefinition = entry.normalizedDefinition;
          }

          const baselineTool = baselineDefinition || {
            status: 'NOT_IN_BASELINE',
            securityAlert: 'UNAUTHORIZED CAPABILITY INJECTION',
            note: 'This tool was not present in the frozen baseline.',
            toolName: event.toolName,
          };

          const isOpen = event.status === 'open';
          const isHighRisk = event.severity === 'high';

          return (
            <Paper
              key={event.eventId}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: isOpen
                  ? (isHighRisk
                    ? (isDark ? 'rgba(250,82,82,0.4)' : 'rgba(220,38,38,0.3)')
                    : (isDark ? 'rgba(245,166,35,0.35)' : 'rgba(217,119,6,0.25)'))
                  : border,
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Card Header stripe */}
              {isOpen && (
                <Box sx={{
                  height: 3,
                  backgroundColor: isHighRisk ? danger : warning,
                  opacity: 0.85,
                }} />
              )}

              <Box sx={{ p: 2.5 }}>
                {/* Top row: tool name + badges + time */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isOpen
                      ? <ErrorOutlineIcon sx={{ fontSize: 18, color: isHighRisk ? danger : warning }} />
                      : <CheckCircleOutlineIcon sx={{ fontSize: 18, color: accent }} />}
                    <Typography sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', color: 'text.primary' }}>
                      {event.toolName}
                    </Typography>
                    <Chip
                      label={isHighRisk ? '⚠ HIGH RISK' : 'MEDIUM'}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '5px',
                        backgroundColor: isHighRisk
                          ? (isDark ? 'rgba(250,82,82,0.15)' : 'rgba(220,38,38,0.1)')
                          : (isDark ? 'rgba(245,166,35,0.15)' : 'rgba(217,119,6,0.1)'),
                        color: isHighRisk ? danger : warning,
                      }}
                    />
                    {!isOpen && (
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: '13px !important' }} />}
                        label="Resolved"
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, borderRadius: '5px', backgroundColor: isDark ? 'rgba(62,207,142,0.12)' : 'rgba(0,196,117,0.08)', color: accent }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.76rem' }}>
                    {timeAgo(event.detectedAt)}
                  </Typography>
                </Box>

                {/* Changes list */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                  {event.changes.map((ch, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.25,
                        px: 1.5, py: 1.1,
                        backgroundColor: surfaceBg,
                        borderRadius: '7px',
                        border: `1px solid ${border}`,
                      }}
                    >
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%', mt: 0.75, flexShrink: 0,
                        backgroundColor: ch.type === 'added' ? danger : warning,
                      }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.84rem', mb: 0.2 }}>
                          {ch.reason}
                        </Typography>
                        <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.76rem', lineHeight: 1.5 }}>
                          <code style={{ fontFamily: 'monospace', fontSize: '0.75em', backgroundColor: isDark ? '#242424' : '#E5E7EB', padding: '1px 5px', borderRadius: 3 }}>{ch.path}</code>
                          {' '}&mdash;{' '}{ch.whyItMatters}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Expandable Diff */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mb: 2 }}>
                  <DiffViewer
                    baselineJson={baselineTool}
                    currentJson={currentTool || { name: event.toolName, changes: event.changes }}
                    baselineTitle="Trusted Baseline"
                    currentTitle="Detected (Live)"
                  />
                </Collapse>

                {/* Action row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: `1px solid ${border}`, flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<CodeIcon sx={{ fontSize: 14 }} />}
                    endIcon={isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: 14 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />}
                    onClick={() => toggleDiff(event.eventId)}
                    sx={{ textTransform: 'none', fontSize: '0.78rem', color: textMuted, fontWeight: 500, '&:hover': { color: 'text.primary' } }}
                  >
                    {isExpanded ? 'Hide Diff' : 'Inspect Diff'}
                  </Button>
                  {isOpen && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isRestoring}
                        startIcon={isRestoring ? <CircularProgress size={12} color="inherit" /> : null}
                        onClick={handleRejectThreat}
                        sx={{
                          textTransform: 'none', fontSize: '0.8rem', fontWeight: 600,
                          borderRadius: '7px', px: 2, py: 0.5,
                          borderColor: danger, color: danger,
                          '&:hover': { backgroundColor: isDark ? 'rgba(250,82,82,0.08)' : 'rgba(220,38,38,0.06)' },
                        }}
                      >
                        {isRestoring ? 'Restoring…' : 'Reject Threat (Restore)'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                        sx={{
                          textTransform: 'none', fontSize: '0.8rem', fontWeight: 600,
                          borderRadius: '7px', px: 2, py: 0.5,
                          backgroundColor: accent, color: isDark ? '#121212' : '#FFFFFF',
                          boxShadow: 'none',
                          '&:hover': { backgroundColor: isDark ? '#2A9B62' : '#059669', boxShadow: 'none' },
                        }}
                      >
                        Accept & Resolve
                      </Button>
                    </Box>
                  )}
                </Box>
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
        title="Accept & Re-baseline?"
        description="This will update the trusted baseline fingerprint with the current tool definitions and resolve this drift alert."
        confirmText="Confirm & Re-baseline"
        onConfirm={() => {
          if (selectedEvent) {
            acceptDriftEvent(selectedEvent.eventId, selectedEvent.toolId);
            setSelectedEvent(null);
            setFeedback({
              message: '✓ Drift accepted! Baseline updated and tool verified SAFE.',
              severity: 'success'
            });
          }
        }}
        onCancel={() => setSelectedEvent(null)}
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert onClose={() => setFeedback(null)} severity={feedback.severity} sx={{ width: '100%', fontWeight: 600 }}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};
