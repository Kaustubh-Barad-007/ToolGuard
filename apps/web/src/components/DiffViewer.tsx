import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface DiffViewerProps {
  baselineJson: unknown;
  currentJson: unknown;
  baselineTitle?: string;
  currentTitle?: string;
}

function formatJsonLines(obj: unknown): string[] {
  if (!obj) return [];
  return JSON.stringify(obj, null, 2).split('\n');
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  baselineJson,
  currentJson,
  baselineTitle = 'BASELINE (TRUSTED)',
  currentTitle = 'CURRENT DEFINITION'
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState<'split' | 'unified'>(isMobile ? 'unified' : 'split');
  const [copied, setCopied] = useState(false);

  const baselineLines = formatJsonLines(baselineJson);
  const currentLines = formatJsonLines(currentJson);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgContainer = isDark ? '#0b0f19' : '#ffffff';
  const bgHeader = isDark ? '#111827' : '#f8fafc';
  const borderColor = isDark ? '#1f2937' : '#e2e8f0';
  const textColor = isDark ? '#e5e7eb' : '#0f172a';
  const lineNumberColor = isDark ? '#4b5563' : '#94a3b8';

  const addBg = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.09)';
  const addColor = isDark ? '#34d399' : '#047857';
  const remBg = isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.09)';
  const remColor = isDark ? '#fb7185' : '#be123c';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        borderColor,
        backgroundColor: bgContainer,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px -2px rgba(15,23,42,0.04)'
      }}
    >
      {/* Diff Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.8,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgHeader
        }}
      >
        <Tabs
          value={isMobile ? 'unified' : activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 32,
            '& .MuiTab-root': {
              minHeight: 32,
              py: 0,
              px: 1.5,
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: isDark ? '#10b981' : '#059669'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: isDark ? '#10b981' : '#059669',
              height: 2,
              borderRadius: 1
            }
          }}
        >
          {!isMobile && <Tab label="Side-by-Side" value="split" />}
          <Tab label="Unified" value="unified" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied!' : 'Copy Current JSON'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              {copied ? <CheckIcon fontSize="small" sx={{ color: '#059669' }} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Side-by-Side View */}
      {activeTab === 'split' && !isMobile ? (
        <Box sx={{ display: 'flex', width: '100%', overflowX: 'auto' }}>
          {/* Baseline column */}
          <Box sx={{ flex: 1, borderRight: `1px solid ${borderColor}` }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#475569', fontWeight: 750, letterSpacing: '0.05em' }}>
                {baselineTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.7 }}>
              {baselineLines.map((line, idx) => {
                const isDiff = !currentLines.includes(line);
                return (
                  <Box
                    key={`base-${idx}`}
                    sx={{
                      display: 'flex',
                      backgroundColor: isDiff ? remBg : 'transparent',
                      color: isDiff ? remColor : textColor,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '4px'
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        width: 34,
                        userSelect: 'none',
                        color: lineNumberColor,
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 500
                      }}
                    >
                      {idx + 1}
                    </Typography>
                    <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 600 : 400 }}>
                      {line}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Current column */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#475569', fontWeight: 750, letterSpacing: '0.05em' }}>
                {currentTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.7 }}>
              {currentLines.map((line, idx) => {
                const isDiff = !baselineLines.includes(line);
                return (
                  <Box
                    key={`curr-${idx}`}
                    sx={{
                      display: 'flex',
                      backgroundColor: isDiff ? addBg : 'transparent',
                      color: isDiff ? addColor : textColor,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '4px'
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        width: 34,
                        userSelect: 'none',
                        color: lineNumberColor,
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 500
                      }}
                    >
                      {idx + 1}
                    </Typography>
                    <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 600 : 400 }}>
                      {line}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ) : (
        /* Unified View */
        <Box component="pre" sx={{ m: 0, p: 2, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.7, overflowX: 'auto' }}>
          {currentLines.map((line, idx) => {
            const isDiff = !baselineLines.includes(line);
            return (
              <Box
                key={`uni-${idx}`}
                sx={{
                  display: 'flex',
                  backgroundColor: isDiff ? addBg : 'transparent',
                  color: isDiff ? addColor : textColor,
                  px: 0.75,
                  py: 0.1,
                  borderRadius: '4px'
                }}
              >
                <Typography component="span" sx={{ width: 36, userSelect: 'none', color: lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 500 }}>
                  {idx + 1}
                </Typography>
                <Typography component="span" sx={{ width: 18, userSelect: 'none', color: isDiff ? addColor : lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 700 }}>
                  {isDiff ? '+' : ' '}
                </Typography>
                <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 600 : 400 }}>
                  {line}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};
