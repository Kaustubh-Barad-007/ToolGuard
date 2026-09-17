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

  const bgContainer = isDark ? '#0b0f19' : '#f8fafc';
  const bgHeader = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1f2937' : '#e2e8f0';
  const textColor = isDark ? '#e5e7eb' : '#1e293b';
  const lineNumberColor = isDark ? '#4b5563' : '#94a3b8';

  const addBg = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)';
  const addColor = isDark ? '#34d399' : '#059669';
  const remBg = isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.12)';
  const remColor = isDark ? '#fb7185' : '#e11d48';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor,
        backgroundColor: bgContainer
      }}
    >
      {/* Diff Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.75,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgHeader
        }}
      >
        <Tabs
          value={isMobile ? 'unified' : activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ minHeight: 30, '& .MuiTab-root': { minHeight: 30, py: 0, fontSize: '0.75rem', fontWeight: 600 } }}
        >
          {!isMobile && <Tab label="Side-by-Side" value="split" />}
          <Tab label="Unified" value="unified" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied!' : 'Copy Current JSON'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary' }}>
              {copied ? <CheckIcon fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Side-by-Side View */}
      {activeTab === 'split' && !isMobile ? (
        <Box sx={{ display: 'flex', width: '100%', overflowX: 'auto' }}>
          {/* Baseline column */}
          <Box sx={{ flex: 1, borderRight: `1px solid ${borderColor}` }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                {baselineTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.65 }}>
              {baselineLines.map((line, idx) => {
                const isDiff = !currentLines.includes(line);
                return (
                  <Box
                    key={`base-${idx}`}
                    sx={{
                      display: 'flex',
                      backgroundColor: isDiff ? remBg : 'transparent',
                      color: isDiff ? remColor : textColor,
                      px: 0.5,
                      borderRadius: '3px'
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        width: 32,
                        userSelect: 'none',
                        color: lineNumberColor,
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      {idx + 1}
                    </Typography>
                    <Box component="span" sx={{ whiteSpace: 'pre' }}>
                      {line}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Current column */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                {currentTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.65 }}>
              {currentLines.map((line, idx) => {
                const isDiff = !baselineLines.includes(line);
                return (
                  <Box
                    key={`curr-${idx}`}
                    sx={{
                      display: 'flex',
                      backgroundColor: isDiff ? addBg : 'transparent',
                      color: isDiff ? addColor : textColor,
                      px: 0.5,
                      borderRadius: '3px'
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        width: 32,
                        userSelect: 'none',
                        color: lineNumberColor,
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      {idx + 1}
                    </Typography>
                    <Box component="span" sx={{ whiteSpace: 'pre' }}>
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
        <Box component="pre" sx={{ m: 0, p: 2, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', lineHeight: 1.65, overflowX: 'auto' }}>
          {currentLines.map((line, idx) => {
            const isDiff = !baselineLines.includes(line);
            return (
              <Box
                key={`uni-${idx}`}
                sx={{
                  display: 'flex',
                  backgroundColor: isDiff ? addBg : 'transparent',
                  color: isDiff ? addColor : textColor,
                  px: 0.5,
                  borderRadius: '3px'
                }}
              >
                <Typography component="span" sx={{ width: 36, userSelect: 'none', color: lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  {idx + 1}
                </Typography>
                <Typography component="span" sx={{ width: 16, userSelect: 'none', color: isDiff ? addColor : lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  {isDiff ? '+' : ' '}
                </Typography>
                <Box component="span" sx={{ whiteSpace: 'pre' }}>
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
