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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldIcon from '@mui/icons-material/Shield';
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

  const border        = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(210, 218, 235, 0.85)';
  const surface       = isDark ? '#0D1220' : '#ffffff';
  const surfaceMuted  = isDark ? '#080B14' : '#F7F8FC';
  const accentPrimary = isDark ? '#00D4AA' : '#008B72';
  const accentViolet  = isDark ? '#7C5CFC' : '#5B3FD4';
  const dangerColor   = isDark ? '#FF4D6A' : '#D63051';
  const warningColor  = isDark ? '#FFB340' : '#CC8A1E';
  const textMuted     = isDark ? '#6B7A99' : '#5A6578';

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
    <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.03em' }}>
              Trust Drift Incident Log
            </Typography>
            <Chip
              label={`${driftEvents.filter(e => e.status === 'open').length} OPEN ALERTS`}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: driftEvents.some(e => e.status === 'open') ? `${dangerColor}15` : `${accentPrimary}15`,
                color: driftEvents.some(e => e.status === 'open') ? dangerColor : accentPrimary,
                border: `1px solid ${driftEvents.some(e => e.status === 'open') ? `${dangerColor}35` : `${accentPrimary}35`}`,
                borderRadius: '7px',
                letterSpacing: '0.04em'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: textMuted, fontWeight: 500 }}>
            Real-time detection comparing active runtime manifests against frozen SHA-256 baseline signatures.
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
            background: 'linear-gradient(135deg, #FFB340 0%, #D97706 100%)',
            color: '#fff',
            boxShadow: '0 3px 12px rgba(217, 119, 6, 0.35)',
            px: 2,
            py: 0.75,
            transition: 'all 0.2s',
            '&:hover': {
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 16px rgba(217, 119, 6, 0.45)',
            }
          }}
        >
          ⚡ Simulate Drift Incident
        </Button>
      </Box>

      {/* ── FILTER TABS ──────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => { setFilter(v); setPage(1); }}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.86rem',
              textTransform: 'none',
              fontWeight: 700,
              py: 0.75,
              px: 2,
              color: textMuted,
              '&.Mui-selected': { color: accentPrimary, fontWeight: 800 }
            },
            '& .MuiTabs-indicator': { backgroundColor: accentPrimary, height: 2.5, borderRadius: 1 }
          }}
        >
          <Tab label={`All Incidents (${driftEvents.length})`} value="all" />
          <Tab label={`High Severity (${driftEvents.filter(e => e.severity === 'high' && e.status === 'open').length})`} value="high" />
          <Tab label={`Needs Review (${driftEvents.filter(e => e.severity === 'medium' && e.status === 'open').length})`} value="review" />
          <Tab label={`Resolved (${driftEvents.filter(e => e.status === 'accepted' || e.status === 'resolved').length})`} value="resolved" />
        </Tabs>
      </Box>

      {/* ── EMPTY STATE ──────────────────────────────────────────────────────── */}
      {displayed.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            borderRadius: '16px',
            borderColor: border,
            backgroundColor: surface,
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 8px 24px rgba(13,17,23,0.06)'
          }}
        >
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            backgroundColor: `${accentPrimary}15`,
            color: accentPrimary,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            boxShadow: `0 8px 20px ${accentPrimary}25`
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
            Cryptographic Baseline Intact
          </Typography>
          <Typography variant="body1" sx={{ color: textMuted, maxWidth: 500, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
            All discovered capabilities in this workspace strictly match their authorized SHA-256 fingerprint. No unauthorized modifications detected.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={triggerScan}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 750,
                px: 2.5,
                py: 0.85
              }}
            >
              Run Verification Scan
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BoltIcon sx={{ fontSize: '15px !important', color: warningColor }} />}
              onClick={loadJudgeDemo}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: `${warningColor}45`,
                color: warningColor,
                backgroundColor: `${warningColor}08`,
                fontWeight: 750,
                px: 2.5,
                py: 0.85,
                '&:hover': { borderColor: warningColor, backgroundColor: `${warningColor}15` }
              }}
            >
              Test Simulated Drift
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── EVENTS LIST ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        {displayed.map(event => {
          const isExpanded = Boolean(expandedDiffs[event.eventId]);
          const currentTool = tools.find(t => t.id === event.toolId || t.name === event.toolName);
          const baselineTool = baseline?.tools?.[event.toolId]?.normalizedDefinition || {
            name: event.toolName,
            status: 'baseline_not_found'
          };

          const isHigh = event.severity === 'high';
          const cardBorderAccent = event.status === 'open'
            ? (isHigh ? dangerColor : warningColor)
            : accentPrimary;

          return (
            <Paper
              key={event.eventId}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: surface,
                borderColor: event.status === 'open' ? `${cardBorderAccent}35` : border,
                borderLeft: `4px solid ${cardBorderAccent}`,
                boxShadow: event.status === 'open' && isHigh
                  ? (isDark ? `0 16px 40px rgba(0,0,0,0.55), 0 0 20px ${dangerColor}15` : `0 8px 24px rgba(255, 77, 106, 0.12)`)
                  : (isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(13,17,23,0.05)'),
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  boxShadow: isDark
                    ? `0 20px 50px rgba(0,0,0,0.6), 0 0 25px ${cardBorderAccent}20`
                    : `0 10px 28px rgba(13, 17, 23, 0.08)`,
                }
              }}
            >
              {/* Event Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{
                    fontWeight: 850,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.05rem',
                    color: 'text.primary',
                    letterSpacing: '-0.02em'
                  }}>
                    {event.toolName}
                  </Typography>
                  <StatusBadge status={event.severity} />
                  {event.status !== 'open' && (
                    <Chip
                      label="RESOLVED / BASELINE FROZEN"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.67rem',
                        fontWeight: 800,
                        backgroundColor: `${accentPrimary}15`,
                        color: accentPrimary,
                        border: `1px solid ${accentPrimary}35`,
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: textMuted, fontWeight: 600, fontSize: '0.76rem' }}>
                  Detected: {new Date(event.detectedAt).toLocaleTimeString()} · SHA-256 Mismatch
                </Typography>
              </Box>

              {/* Changes Callout Box */}
              <Box sx={{ mb: 2.5 }}>
                {event.changes.map((ch, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2.2,
                      mb: 1.5,
                      backgroundColor: surfaceMuted,
                      borderRadius: '12px',
                      border: `1px solid ${border}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: textMuted, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                        PROPERTY ALTERED:{' '}
                        <Box
                          component="code"
                          sx={{
                            color: isDark ? '#7C5CFC' : '#5B3FD4',
                            fontWeight: 750,
                            backgroundColor: isDark ? 'rgba(124, 92, 252, 0.12)' : 'rgba(91, 63, 212, 0.08)',
                            px: 1,
                            py: 0.25,
                            borderRadius: '5px',
                            fontFamily: '"JetBrains Mono", monospace'
                          }}
                        >
                          {ch.path}
                        </Box>
                      </Typography>
                      <Chip
                        label={ch.type.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          borderRadius: '5px',
                          backgroundColor: ch.type === 'added' ? `${dangerColor}15` : `${warningColor}15`,
                          color: ch.type === 'added' ? dangerColor : warningColor
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700, mb: 0.75, fontSize: '0.9rem' }}>
                      {ch.reason}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textMuted, display: 'block', lineHeight: 1.6, fontSize: '0.78rem' }}>
                      <strong style={{ color: dangerColor }}>Security Impact:</strong> {ch.whyItMatters}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Expandable Code Diff */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mb: 2.5 }}>
                <Box sx={{ mt: 1.5 }}>
                  <DiffViewer
                    baselineJson={baselineTool}
                    currentJson={currentTool || { name: event.toolName, note: 'Current manifest changed' }}
                    baselineTitle={`FROZEN BASELINE DEFINITION (SHA-256)`}
                    currentTitle={`CURRENT DETECTED STATE (${event.toolName})`}
                  />
                </Box>
              </Collapse>

              {/* Actions Toolbar */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: `1px solid ${border}`,
                flexWrap: 'wrap',
                gap: 1.5
              }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CodeIcon sx={{ fontSize: '16px !important' }} />}
                  endIcon={isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: '16px !important' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: '16px !important' }} />}
                  onClick={() => toggleDiff(event.eventId)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    color: textMuted,
                    fontWeight: 750,
                    '&:hover': { color: accentPrimary }
                  }}
                >
                  {isExpanded ? 'Hide Manifest Diff' : 'Inspect Raw Manifest Diff'}
                </Button>

                {event.status === 'open' && (
                  <Button
                    size="small"
                    onClick={() => setSelectedEvent({ eventId: event.eventId, toolId: event.toolId })}
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 750,
                      borderRadius: '8px',
                      px: 2.5,
                      py: 0.75,
                    }}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="medium" />
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
