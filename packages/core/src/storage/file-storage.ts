import { promises as fs } from 'fs';
import * as path from 'path';
import { Baseline, DEFAULT_PATHS, stripBom } from '@toolguard/shared';

export interface BaselineHistoryRecord {
  version: number;
  versionTag: string;
  timestamp: string;
  actor: string;
  action: 'INITIALIZED' | 'ACCEPTED_DRIFT' | 'BASELINE_CREATED' | 'IMPORTED';
  title: string;
  toolCount: number;
  toolsAffected?: string[];
  changes?: Array<{
    toolName: string;
    changeType: 'added' | 'removed' | 'modified';
    summary: string;
    path?: string;
    before?: unknown;
    after?: unknown;
  }>;
  baselineHash?: string;
}

export class FileBaselineStorage {
  /**
   * Reads the baseline file from the local workspace.
   */
  static async loadLocalBaseline(workspacePath: string): Promise<Baseline | null> {
    const target = path.join(workspacePath, DEFAULT_PATHS.BASELINE_FILE);
    try {
      const content = await fs.readFile(target, 'utf8');
      return JSON.parse(stripBom(content).trim()) as Baseline;
    } catch {
      return null;
    }
  }

  /**
   * Writes the baseline file to the local workspace.
   */
  static async saveLocalBaseline(workspacePath: string, baseline: Baseline): Promise<void> {
    const dir = path.join(workspacePath, '.toolguard');
    await fs.mkdir(dir, { recursive: true });
    const target = path.join(dir, 'baseline.json');
    await fs.writeFile(target, JSON.stringify(baseline, null, 2), 'utf8');
  }

  /**
   * Reads the version history file from the local workspace.
   */
  static async loadLocalHistory(workspacePath: string): Promise<BaselineHistoryRecord[]> {
    const target = path.join(workspacePath, '.toolguard', 'history.json');
    try {
      const content = await fs.readFile(target, 'utf8');
      const parsed = JSON.parse(stripBom(content).trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      const baseline = await this.loadLocalBaseline(workspacePath);
      if (baseline) {
        const toolNames = Object.keys(baseline.tools || {});
        return [{
          version: baseline.version || 1,
          versionTag: `v1.0.${Math.max(0, (baseline.version || 1) - 1)}`,
          timestamp: baseline.createdAt || new Date().toISOString(),
          actor: baseline.createdBy || 'developer',
          action: 'INITIALIZED',
          title: 'Initial Trusted Baseline Verified',
          toolCount: baseline.toolCount || toolNames.length,
          toolsAffected: toolNames,
          changes: toolNames.map(name => {
            const entry = baseline.tools[name];
            const perms = entry?.normalizedDefinition?.permissions || [];
            return {
              toolName: name,
              changeType: 'added' as const,
              summary: `${entry?.normalizedDefinition?.description || name} (permissions: ${perms.length > 0 ? perms.join(', ') : 'none'})`
            };
          }),
          baselineHash: baseline.baselineId
        }];
      }
      return [];
    }
  }

  /**
   * Writes the version history file to the local workspace.
   */
  static async saveLocalHistory(workspacePath: string, history: BaselineHistoryRecord[]): Promise<void> {
    const dir = path.join(workspacePath, '.toolguard');
    await fs.mkdir(dir, { recursive: true });
    const target = path.join(dir, 'history.json');
    await fs.writeFile(target, JSON.stringify(history, null, 2), 'utf8');
  }

  /**
   * Appends a new version entry to the history file.
   */
  static async appendLocalHistory(workspacePath: string, record: BaselineHistoryRecord): Promise<void> {
    const history = await this.loadLocalHistory(workspacePath);
    const filtered = history.filter(h => h.version !== record.version);
    const updated = [record, ...filtered];
    await this.saveLocalHistory(workspacePath, updated);
  }
}
