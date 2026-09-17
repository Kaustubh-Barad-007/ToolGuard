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
  useTheme,
  CircularProgress
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DiffViewer } from '../components/DiffViewer';

export const DriftEventsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { driftEvents, acceptDriftEvent, triggerScan, loadJudgeDemo, baseline, tools, isVerifying } = useDemoData();
  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; toolId: string } | null>(null);
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});

  const border       = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const surface      = isDark ? '#0d1117' : '#ffffff';
  const surfaceMuted = isDark ? '#080c10' : '#f6f8fa';
  const accent       = isDark ? '#00d4aa' : '#008b72';
  const danger       = isDark ? '#f85149' : '#cf222e';
  const warning      = isDark ? '#d29922' : '#9a6700';
  const textMuted    = isDark ? '#8b949e' : '#57606a';

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

  const openCount = driftEvents.filter(e => e.status === 'open').length;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Drift Incidents
            </Typography>
            <Chip
              label={openCount === 0 ? 'All clear' : `${openCount} open`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: openCount > 0
                  ? (isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)')
                  : (isDark ? 'rgba(0, 212, 170, 0.12)' : 'rgba(0, 139, 114, 0.08)'),
                color: openCount > 0 ? danger : accent,
                border: `1px solid ${openCount > 0 ? (isDark ? 'rgba(248, 81, 73, 0.25)' : 'rgba(207, 34, 46, 0.2)') : (isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 139, 114, 0.2)')}`,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: textMuted, mt: 0.25 }}>
            Manifest alterations detected against frozen cryptographic baseline signatures.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={loadJudgeDemo}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.82rem',
            borderRadius: '6px',
            borderColor: border,
            color: textMuted,
            px: 1.75,
            py: 0.6,
            '&:hover': {
              borderColor: warning,
              color: warning,
              backgroundColor: isDark ? 'rgba(210, 153, 34, 0.08)' : 'rgba(154, 103, 0, 0.04)',
            }
          }}
        >
          Simulate Incident
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
              minHeight: 40,
              fontSize: '0.82rem',
              textTransform: 'none',
              fontWeight: 500,
              py: 0.5,
              px: 1.75,
              color: textMuted,
              '&.Mui-selected': { color: 'text.primary', fontWeight: 600 }
            },
            '& .MuiTabs-indicator': { backgroundColor: accent, height: 2 }
          }}
        >
          <Tab label={`All (${driftEvents.length})`} value="all" />
          <Tab label={`High Severity (${driftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`} value="high" />
          <Tab label={`Review Required (${driftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`} value="review" />
          <Tab label={`Resolved (${driftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`} value="resolved" />
        </Tabs>
      </Box>

      {/* Empty State */}
      {displayed.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            borderRadius: '10px',
            borderColor: border,
            backgroundColor: surface,
          }}
        >
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.1)',
            color: accent,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            No Drift Incidents Detected
          </Typography>
          <Typography variant="body2" sx={{ color: textMuted, maxWidth: 440, mx: 'auto', mb: 3 }}>
            All discovered capabilities in this workspace match authorized baseline fingerprints.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              disabled={isVerifying}
              startIcon={isVerifying ? <CircularProgress size={13} color="inherit" /> : null}
              onClick={triggerScan}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: 2,
                py: 0.6
              }}
            >
              {isVerifying ? 'Verifying Baseline…' : 'Run Verification Scan'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={loadJudgeDemo}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                borderColor: border,
                color: textMuted,
                fontWeight: 500,
                fontSize: '0.82rem',
                px: 2,
                py: 0.6,
                '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
              }}
            >
              Simulate Incident
            </Button>
          </Box>
        </Paper>
      )}

      {/* Events List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {displayed.map(event => {
          const isExpanded = Boolean(expandedDiffs[event.eventId]);
          const currentTool = tools.find(t => t.id === event.toolId || t.name === event.toolName);
          const baselineTool = baseline?.tools?.[event.toolId]?.normalizedDefinition || {
            name: event.toolName,
            status: 'baseline_not_found'
          };

          const isOpen = event.status === 'open';

          return (
            <Paper
              key={event.eventId}
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: '10px',
                backgroundColor: surface,
                borderColor: isOpen ? (isDark ? 'rgba(248, 81, 73, 0.3)' : 'rgba(207, 34, 46, 0.2)') : border,
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Event Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <TerminalOutlinedIcon sx={{ fontSize: 18, color: textMuted }} />
                  <Typography sx={{
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.92rem',
                    color: 'text.primary',
                  }}>
                    {event.toolName}
                  </Typography>
                  <StatusBadge status={event.severity} />
                  {!isOpen && (
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: '13px !important' }} />}
                      label="Resolved"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: isDark ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 139, 114, 0.08)',
                        color: accent,
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.74rem' }}>
                  Detected {new Date(event.detectedAt).toLocaleTimeString()} · Hash mismatch
                </Typography>
              </Box>

              {/* Changes Summary Box */}
              <Box sx={{ mb: 2 }}>
                {event.changes.map((ch, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      backgroundColor: surfaceMuted,
                      borderRadius: '8px',
                      border: `1px solid ${border}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.72rem' }}>
                          PROPERTY:
                        </Typography>
                        <Box
                          component="code"
                          sx={{
                            color: isDark ? '#e6edf3' : '#24292f',
                            fontWeight: 600,
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            px: 0.75,
                            py: 0.2,
                            borderRadius: '4px',
                            fontSize: '0.76rem',
                            fontFamily: '"JetBrains Mono", monospace'
                          }}
                        >
                          {ch.path}
                        </Box>
                      </Box>
                      <Chip
                        label={ch.type}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          backgroundColor: ch.type === 'added'
                            ? (isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(207, 34, 46, 0.08)')
                            : (isDark ? 'rgba(210, 153, 34, 0.12)' : 'rgba(154, 103, 0, 0.08)'),
                          color: ch.type === 'added' ? danger : warning
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5, fontSize: '0.84rem' }}>
                      {ch.reason}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textMuted, display: 'block', fontSize: '0.76rem' }}>
                      <strong style={{ color: danger }}>Security Note:</strong> {ch.whyItMatters}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Expandable Code Diff */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mb: 2 }}>
                <Box sx={{ mt: 1 }}>
                  <DiffViewer
                    baselineJson={baselineTool}
                    currentJson={currentTool || { name: event.toolName, note: 'Current manifest modified' }}
                    baselineTitle="Baseline (Frozen)"
                    currentTitle="Active Manifest (Detected)"
                  />
                </Box>
              </Collapse>

              {/* Action Toolbar */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1.5,
                borderTop: `1px solid ${border}`,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CodeIcon sx={{ fontSize: 15 }} />}
                  endIcon={isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: 15 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
                  onClick={() => toggleDiff(event.eventId)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    color: textMuted,
                    fontWeight: 500,
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  {isExpanded ? 'Hide Manifest Diff' : 'Inspect Raw Manifest Diff'}
                </Button>

                {isOpen && (
                  <Button
                    size="small"
                    onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    Accept &amp; Re-baseline
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small" />
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(selectedEvent)}
        title="Accept & Re-baseline?"
        description="This will update the trusted SHA-256 fingerprint with current tool definitions and resolve the active drift alert."
        confirmText="Confirm & Re-baseline"
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
