import { promises as fs } from 'fs';
import * as path from 'path';
import { Baseline, DEFAULT_PATHS, stripBom } from '@toolguard/shared';

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
}
