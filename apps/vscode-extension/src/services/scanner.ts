import * as path from 'path';
import {
  BaselineManager,
  formatDriftExplanation
} from '@toolguard/core';
import {
  discoverWorkspaceTools,
  FileBaselineStorage
} from '@toolguard/core/node';
import {
  ToolDefinition,
  Baseline,
  ScanResult,
  ToolScanStatus
} from '@toolguard/shared';

export class ExtensionScanService {
  async discoverTools(workspacePath: string): Promise<ToolDefinition[]> {
    return discoverWorkspaceTools(workspacePath);
  }

  async loadBaseline(workspacePath: string): Promise<Baseline | null> {
    return FileBaselineStorage.loadLocalBaseline(workspacePath);
  }

  async createBaseline(workspacePath: string, tools: ToolDefinition[]): Promise<Baseline> {
    const baseline = BaselineManager.createBaseline(tools, path.basename(workspacePath));
    await FileBaselineStorage.saveLocalBaseline(workspacePath, baseline);
    return baseline;
  }

  compareWithBaseline(tools: ToolDefinition[], baseline: Baseline): ScanResult {
    return BaselineManager.compare(tools, baseline);
  }

  explainDrift(tool: ToolScanStatus): string {
    return formatDriftExplanation(tool.name, tool.changes);
  }
}
