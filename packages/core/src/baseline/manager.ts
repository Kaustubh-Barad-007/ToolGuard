import {
  Baseline,
  BaselineToolEntry,
  ToolDefinition,
  ScanResult,
  ToolScanStatus,
  TrustStatus,
  RiskSeverity
} from '@toolguard/shared';
import { normalizeToolDefinition } from '../normalization/normalizer.js';
import { computeFingerprint } from '../fingerprint/hasher.js';
import { diffToolDefinitions } from '../diff/differ.js';
import { evaluateChangeRisk, determineOverallSeverity } from '../risk/rules.js';
import { redactSensitiveData } from '../security/redaction.js';

export class BaselineManager {
  /**
   * Creates a new baseline record from a list of discovered tools.
   */
  static createBaseline(
    tools: ToolDefinition[],
    projectId = 'local-project',
    createdBy = 'developer',
    version = 1
  ): Baseline {
    const baselineId = `bl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const toolsMap: Record<string, BaselineToolEntry> = {};

    for (const tool of tools) {
      const sanitizedTool = redactSensitiveData(tool);
      const normalized = normalizeToolDefinition(sanitizedTool);
      const fingerprint = computeFingerprint(normalized);
      const toolId = tool.id || tool.name;

      toolsMap[toolId] = {
        toolId,
        name: tool.name,
        normalizedDefinition: normalized,
        fingerprint: fingerprint.hash,
        metadata: tool.metadata,
        createdAt: new Date().toISOString()
      };
    }

    return {
      baselineId,
      projectId,
      version,
      createdAt: new Date().toISOString(),
      createdBy,
      algorithm: 'SHA-256',
      tools: toolsMap,
      toolCount: Object.keys(toolsMap).length
    };
  }

  /**
   * Compares the current set of tools against the trusted baseline.
   */
  static compare(tools: ToolDefinition[], baseline: Baseline): ScanResult {
    const scanId = `scan-${Date.now()}`;
    const scannedAt = new Date().toISOString();
    const toolStatuses: ToolScanStatus[] = [];
    let driftCount = 0;
    let highestSeverity: RiskSeverity | 'none' = 'none';

    // Map current tools by ID
    const currentToolsMap = new Map<string, ToolDefinition>();
    for (const t of tools) {
      currentToolsMap.set(t.id || t.name, t);
    }

    // Check all tools in baseline
    for (const [toolId, baselineEntry] of Object.entries(baseline.tools)) {
      const currentTool = currentToolsMap.get(toolId);

      if (!currentTool) {
        // Tool in baseline was removed
        const changes = [
          evaluateChangeRisk({
            path: 'tool',
            type: 'removed',
            before: baselineEntry.name,
            after: undefined
          })
        ];
        driftCount++;
        toolStatuses.push({
          toolId,
          name: baselineEntry.name,
          status: 'REVIEW',
          driftDetected: true,
          fingerprint: '',
          baselineFingerprint: baselineEntry.fingerprint,
          changes,
          lastChecked: scannedAt
        });
        continue;
      }

      const sanitizedCurrent = redactSensitiveData(currentTool);
      const normalizedCurrent = normalizeToolDefinition(sanitizedCurrent);
      const currentFingerprint = computeFingerprint(normalizedCurrent);

      if (currentFingerprint.hash === baselineEntry.fingerprint) {
        // Safe: Fingerprints match exactly
        toolStatuses.push({
          toolId,
          name: currentTool.name,
          status: 'SAFE',
          driftDetected: false,
          fingerprint: currentFingerprint.hash,
          baselineFingerprint: baselineEntry.fingerprint,
          changes: [],
          lastChecked: scannedAt
        });
      } else {
        // Drift detected: compute structural diff & evaluate risk
        driftCount++;
        const rawDiffs = diffToolDefinitions(baselineEntry.normalizedDefinition, normalizedCurrent);
        const evaluatedChanges = rawDiffs.map(evaluateChangeRisk);
        const severity = determineOverallSeverity(evaluatedChanges);
        const trustStatus: TrustStatus = severity === 'high' ? 'HIGH RISK' : 'REVIEW';

        if (severity === 'high') {
          highestSeverity = 'high';
        } else if (severity === 'medium' && highestSeverity !== 'high') {
          highestSeverity = 'medium';
        } else if (highestSeverity === 'none') {
          highestSeverity = 'low';
        }

        toolStatuses.push({
          toolId,
          name: currentTool.name,
          status: trustStatus,
          driftDetected: true,
          fingerprint: currentFingerprint.hash,
          baselineFingerprint: baselineEntry.fingerprint,
          changes: evaluatedChanges,
          lastChecked: scannedAt
        });
      }
    }

    // Check for newly introduced tools not in baseline
    for (const [id, currentTool] of currentToolsMap.entries()) {
      if (!baseline.tools[id]) {
        driftCount++;
        const sanitized = redactSensitiveData(currentTool);
        const normalized = normalizeToolDefinition(sanitized);
        const fp = computeFingerprint(normalized);
        const changes = [
          evaluateChangeRisk({
            path: 'tool',
            type: 'added',
            before: undefined,
            after: currentTool.name
          })
        ];

        toolStatuses.push({
          toolId: id,
          name: currentTool.name,
          status: 'REVIEW',
          driftDetected: true,
          fingerprint: fp.hash,
          changes,
          lastChecked: scannedAt
        });
      }
    }

    const safeTools = toolStatuses.filter(t => !t.driftDetected).length;

    return {
      scanId,
      projectId: baseline.projectId,
      scannedAt,
      totalTools: toolStatuses.length,
      safeTools,
      driftCount,
      status: driftCount > 0 ? 'DRIFT_DETECTED' : 'SAFE',
      highestSeverity,
      tools: toolStatuses
    };
  }

  /**
   * Accepts a tool change and produces a new baseline version.
   * Never mutates historical baseline in place.
   */
  static acceptToolChange(
    existingBaseline: Baseline,
    tool: ToolDefinition,
    actorId = 'developer'
  ): Baseline {
    const sanitized = redactSensitiveData(tool);
    const normalized = normalizeToolDefinition(sanitized);
    const fingerprint = computeFingerprint(normalized);
    const toolId = tool.id || tool.name;

    const newTools: Record<string, BaselineToolEntry> = {
      ...existingBaseline.tools,
      [toolId]: {
        toolId,
        name: tool.name,
        normalizedDefinition: normalized,
        fingerprint: fingerprint.hash,
        metadata: tool.metadata,
        createdAt: new Date().toISOString()
      }
    };

    return {
      baselineId: `bl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      projectId: existingBaseline.projectId,
      version: existingBaseline.version + 1,
      createdAt: new Date().toISOString(),
      createdBy: actorId,
      algorithm: 'SHA-256',
      tools: newTools,
      toolCount: Object.keys(newTools).length
    };
  }
}
