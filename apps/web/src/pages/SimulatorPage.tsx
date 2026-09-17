import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SecurityIcon from '@mui/icons-material/Security';
import {
  normalizeToolDefinition,
  computeFingerprint,
  diffToolDefinitions,
  evaluateChangeRisk,
  determineOverallSeverity
} from '@toolguard/core';
import { ToolDefinition, DriftChange } from '@toolguard/shared';
import { StatusBadge } from '../components/StatusBadge';
import { DiffViewer } from '../components/DiffViewer';

const PRESETS: { name: string; tool: ToolDefinition }[] = [
  {
    name: 'Project Files (Read-Only)',
    tool: {
      name: 'project-files',
      description: 'Local project files reader',
      permissions: ['read'],
      endpoint: 'local',
      execution: { enabled: false }
    }
  },
  {
    name: 'Safe Terminal Runner',
    tool: {
      name: 'terminal-runner',
      description: 'Run project tests in sandboxed container',
      permissions: ['read'],
      endpoint: 'stdio',
      execution: { enabled: false }
    }
  },
  {
    name: 'Internal Database Connector',
    tool: {
      name: 'internal-database',
      description: 'Query internal read replica',
      permissions: ['read'],
      endpoint: 'postgres://internal.db:5432',
      authentication: { required: true, type: 'bearer', scopes: ['read'] },
      execution: { enabled: false }
    }
  }
];

export const SimulatorPage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);

  // Baseline tool definition
  const [baselineTool, setBaselineTool] = useState<ToolDefinition>(PRESETS[0].tool);

  // Current (mutated) tool definition state
  const [name, setName] = useState(baselineTool.name);
  const [description, setDescription] = useState(baselineTool.description || '');
  const [endpoint, setEndpoint] = useState(baselineTool.endpoint || 'local');
  const [permRead, setPermRead] = useState(true);
  const [permWrite, setPermWrite] = useState(false);
  const [permExecute, setPermExecute] = useState(false);
  const [permAdmin, setPermAdmin] = useState(false);
  const [permNetwork, setPermNetwork] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [execEnabled, setExecEnabled] = useState(false);

  // Scan simulation results
  const [scanEvaluated, setScanEvaluated] = useState(false);
  const [evaluatedChanges, setEvaluatedChanges] = useState<DriftChange[]>([]);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'safe'>('safe');

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const preset = PRESETS[idx].tool;
    setBaselineTool(preset);
    setName(preset.name);
    setDescription(preset.description || '');
    setEndpoint(preset.endpoint || 'local');
    setPermRead(preset.permissions?.includes('read') || false);
    setPermWrite(preset.permissions?.includes('write') || false);
    setPermExecute(preset.permissions?.includes('execute') || false);
    setPermAdmin(preset.permissions?.includes('admin') || false);
    setPermNetwork(preset.permissions?.includes('network') || false);
    setAuthRequired(preset.authentication?.required || false);
    setExecEnabled(preset.execution?.enabled || false);
    setScanEvaluated(false);
  };

  const runSimulation = () => {
    // Construct current mutated tool
    const permissions: string[] = [];
    if (permRead) permissions.push('read');
    if (permWrite) permissions.push('write');
    if (permExecute) permissions.push('execute');
    if (permAdmin) permissions.push('admin');
    if (permNetwork) permissions.push('network');

    const currentTool: ToolDefinition = {
      name,
      description,
      endpoint,
      permissions,
      authentication: { required: authRequired },
      execution: { enabled: execEnabled }
    };

    const normBaseline = normalizeToolDefinition(baselineTool);
    const normCurrent = normalizeToolDefinition(currentTool);

    const fpBaseline = computeFingerprint(normBaseline);
    const fpCurrent = computeFingerprint(normCurrent);

    if (fpBaseline.hash === fpCurrent.hash) {
      setSeverity('safe');
      setEvaluatedChanges([]);
    } else {
      const rawDiffs = diffToolDefinitions(normBaseline, normCurrent);
      const evals = rawDiffs.map(evaluateChangeRisk);
      setEvaluatedChanges(evals);
      setSeverity(determineOverallSeverity(evals));
    }

    setScanEvaluated(true);
  };

  const currentToolObject: ToolDefinition = {
    name,
    description,
    endpoint,
    permissions: [
      ...(permRead ? ['read'] : []),
      ...(permWrite ? ['write'] : []),
      ...(permExecute ? ['execute'] : []),
      ...(permAdmin ? ['admin'] : []),
      ...(permNetwork ? ['network'] : [])
    ],
    authentication: { required: authRequired },
    execution: { enabled: execEnabled }
  };

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary' }}>
            Trust Drift Playground & Simulator
          </Typography>
          <Chip label="LIVE ENGINE" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700 }} />
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Simulate capability modifications in real-time and observe how ToolGuard detects, diffs, and classifies security risks.
        </Typography>
      </Box>

      {/* Preset Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
          CHOOSE A BASELINE TOOL PRESET
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {PRESETS.map((preset, idx) => (
            <Button
              key={preset.name}
              variant={selectedPresetIdx === idx ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              onClick={() => handleSelectPreset(idx)}
              sx={{
                borderColor: selectedPresetIdx === idx ? undefined : 'divider',
                color: selectedPresetIdx === idx ? undefined : 'text.primary'
              }}
            >
              {preset.name}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Interactive Mutation Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Baseline Reference (Read-Only) */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                FROZEN BASELINE
              </Typography>
              <Chip label="TRUSTED" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }} />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              This represents the authorized configuration frozen into the trusted baseline.
            </Typography>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'text.primary',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(baselineTool, null, 2)}
            </Box>
          </Paper>
        </Grid>

        {/* Mutated Tool Interactive Form */}
        <Grid item xs={12} md={7}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderColor: 'primary.main',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                MUTATE TOOL CAPABILITIES (LIVE)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={runSimulation}
                sx={{ px: 2.5 }}
              >
                Run Trust Engine
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tool Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  helperText="Change to remote URL to test endpoint expansion"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description / Agent Prompt"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Permission Toggles */}
            <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
              PERMISSIONS & CAPABILITY ELEVATIONS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
              <FormControlLabel
                control={<Checkbox checked={permRead} onChange={(e) => setPermRead(e.target.checked)} />}
                label="read"
              />
              <FormControlLabel
                control={<Checkbox checked={permWrite} onChange={(e) => setPermWrite(e.target.checked)} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />}
                label={<span style={{ color: permWrite ? '#ef4444' : undefined, fontWeight: permWrite ? 700 : 400 }}>write (+HIGH RISK)</span>}
              />
              <FormControlLabel
                control={<Checkbox checked={permExecute} onChange={(e) => setPermExecute(e.target.checked)} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />}
                label={<span style={{ color: permExecute ? '#ef4444' : undefined, fontWeight: permExecute ? 700 : 400 }}>execute (+HIGH RISK)</span>}
              />
              <FormControlLabel
                control={<Checkbox checked={permAdmin} onChange={(e) => setPermAdmin(e.target.checked)} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />}
                label={<span style={{ color: permAdmin ? '#ef4444' : undefined, fontWeight: permAdmin ? 700 : 400 }}>admin (+HIGH RISK)</span>}
              />
              <FormControlLabel
                control={<Checkbox checked={permNetwork} onChange={(e) => setPermNetwork(e.target.checked)} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />}
                label={<span style={{ color: permNetwork ? '#ef4444' : undefined, fontWeight: permNetwork ? 700 : 400 }}>network (+HIGH RISK)</span>}
              />
            </Box>

            {/* Execution / Auth Toggles */}
            <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
              EXECUTION & SECURITY FLAGS
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Checkbox checked={execEnabled} onChange={(e) => setExecEnabled(e.target.checked)} />}
                label="Execution Enabled"
              />
              <FormControlLabel
                control={<Checkbox checked={authRequired} onChange={(e) => setAuthRequired(e.target.checked)} />}
                label="Authentication Required"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Simulation Results Section */}
      {scanEvaluated && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
              Trust Engine Evaluation
            </Typography>
            {severity === 'safe' ? (
              <Chip label="NO DRIFT DETECTED — SAFE" color="success" sx={{ fontWeight: 700 }} />
            ) : (
              <StatusBadge status={severity} />
            )}
          </Box>

          {severity === 'safe' ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Current definition matches baseline fingerprint exactly. No capability drift detected.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {evaluatedChanges.map((change, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    backgroundColor: change.severity === 'high' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                    borderColor: change.severity === 'high' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                    borderRadius: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: change.severity === 'high' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                      RULE: {change.ruleId} (Property: {change.path})
                    </Typography>
                    <StatusBadge status={change.severity} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
                    {change.reason}
                  </Typography>
                  <Box sx={{ p: 1.5, backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#080b11' : '#f1f5f9', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.25 }}>
                      WHY THIS MATTERS:
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {change.whyItMatters}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Diff Viewer */}
          <Typography variant="subtitle2" sx={{ fontWeight: 650, color: 'text.primary', mb: 1.5 }}>
            Structural Property Diff
          </Typography>
          <DiffViewer
            baselineJson={baselineTool}
            currentJson={currentToolObject}
            baselineTitle="BASELINE DEFINITION"
            currentTitle="MUTATED PLAYGROUND DEFINITION"
          />
        </Box>
      )}
    </Box>
  );
};
