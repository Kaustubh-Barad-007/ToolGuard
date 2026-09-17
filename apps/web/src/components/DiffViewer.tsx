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

  const bgContainer = isDark ? '#090d16' : '#f8fafc';
  const bgHeader = isDark ? '#0f1422' : '#f1f5f9';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#cbd5e1' : '#1e293b';
  const lineNumberColor = isDark ? '#4b5563' : '#94a3b8';

  const addBg = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)';
  const addColor = isDark ? '#34d399' : '#047857';
  const remBg = isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)';
  const remColor = isDark ? '#f87171' : '#b91c1c';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
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
          sx={{ minHeight: 32 }}
        >
          {!isMobile && <Tab label="Side-by-Side" value="split" sx={{ minHeight: 32, py: 0, fontSize: '0.78rem', fontWeight: 650 }} />}
          <Tab label="Unified" value="unified" sx={{ minHeight: 32, py: 0, fontSize: '0.78rem', fontWeight: 650 }} />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied!' : 'Copy Current JSON'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: '#8b949e' }}>
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
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                {baselineTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', lineHeight: 1.65 }}>
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
                        width: 36,
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
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                {currentTitle}
              </Typography>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', lineHeight: 1.65 }}>
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
                        width: 36,
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
        <Box component="pre" sx={{ m: 0, p: 2, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', lineHeight: 1.65, overflowX: 'auto' }}>
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
                <Typography component="span" sx={{ width: 40, userSelect: 'none', color: lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  {idx + 1}
                </Typography>
                <Typography component="span" sx={{ width: 20, userSelect: 'none', color: isDiff ? addColor : lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit' }}>
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
