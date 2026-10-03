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
  baselineTitle = 'BASELINE (TRUSTED SHA-256)',
  currentTitle = 'CURRENT RUNTIME MANIFEST'
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

  const bgContainer = isDark ? '#141414' : '#FFFFFF';
  const bgHeader = isDark ? '#171717' : '#F9FAFB';
  const borderColor = isDark ? '#2E2E2E' : '#E5E7EB';
  const textColor = isDark ? '#EDEDED' : '#111827';
  const lineNumberColor = isDark ? '#555555' : '#9CA3AF';

  const addBg = isDark ? 'rgba(62, 207, 142, 0.12)' : 'rgba(0, 196, 117, 0.08)';
  const addColor = isDark ? '#3ECF8E' : '#00C475';
  const remBg = isDark ? 'rgba(250, 82, 82, 0.12)' : 'rgba(220, 38, 38, 0.08)';
  const remColor = isDark ? '#FA5252' : '#DC2626';
  const accentPrimary = isDark ? '#3ECF8E' : '#00C475';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        borderColor,
        backgroundColor: bgContainer,
        boxShadow: 'none',
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
              px: 1.75,
              fontSize: '0.74rem',
              fontWeight: 750,
              borderRadius: '6px',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: accentPrimary
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: accentPrimary,
              height: 2,
              borderRadius: 1
            }
          }}
        >
          {!isMobile && <Tab label="Side-by-Side Diff" value="split" />}
          <Tab label="Unified Diff" value="unified" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied JSON!' : 'Copy Current JSON'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary', '&:hover': { color: accentPrimary } }}>
              {copied ? <CheckIcon fontSize="small" sx={{ color: accentPrimary }} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Side-by-Side View */}
      {activeTab === 'split' && !isMobile ? (
        <Box sx={{ display: 'flex', width: '100%', overflowX: 'auto' }}>
          {/* Baseline column */}
          <Box sx={{ flex: 1, borderRight: `1px solid ${borderColor}` }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? '#171717' : '#F9FAFB', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9E9E9E' : '#6B7280', fontWeight: 650, letterSpacing: '0.04em', fontSize: '0.7rem' }}>
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
                      borderRadius: '4px',
                      borderLeft: isDiff ? `2px solid ${remColor}` : '2px solid transparent',
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
                    <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 650 : 400 }}>
                      {line}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Current column */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ px: 2, py: 0.75, backgroundColor: isDark ? '#171717' : '#F9FAFB', borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="caption" sx={{ color: isDark ? '#9E9E9E' : '#6B7280', fontWeight: 650, letterSpacing: '0.04em', fontSize: '0.7rem' }}>
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
                      borderRadius: '4px',
                      borderLeft: isDiff ? `2px solid ${addColor}` : '2px solid transparent',
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
                    <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 650 : 400 }}>
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
                  borderRadius: '4px',
                  borderLeft: isDiff ? `2px solid ${addColor}` : '2px solid transparent',
                }}
              >
                <Typography component="span" sx={{ width: 36, userSelect: 'none', color: lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 500 }}>
                  {idx + 1}
                </Typography>
                <Typography component="span" sx={{ width: 18, userSelect: 'none', color: isDiff ? addColor : lineNumberColor, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 750 }}>
                  {isDiff ? '+' : ' '}
                </Typography>
                <Box component="span" sx={{ whiteSpace: 'pre', fontWeight: isDiff ? 650 : 400 }}>
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
