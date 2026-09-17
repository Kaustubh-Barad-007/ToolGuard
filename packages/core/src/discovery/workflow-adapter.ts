import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class WorkflowAdapter implements ToolAdapter {
  readonly name = 'GitHub Actions Workflow Tool Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const workflowsDir = path.join(workspacePath, '.github', 'workflows');
    try {
      const stat = await fs.stat(workflowsDir);
      if (stat.isDirectory()) {
        const files = await fs.readdir(workflowsDir);
        return files.some(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      }
    } catch {
      // Directory not present
    }
    return false;
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const workflowsDir = path.join(workspacePath, '.github', 'workflows');
    const tools: ToolDefinition[] = [];

    try {
      const files = await fs.readdir(workflowsDir);
      for (const file of files) {
        if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
        const filePath = path.join(workflowsDir, file);
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          const lines = raw.split('\n');
          let workflowName = file.replace(/\.(yml|yaml)$/, '');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('name:')) {
              workflowName = trimmed.replace(/^name:\s*['"]?/, '').replace(/['"]?\s*$/, '');
              break;
            }
          }

          const permissions: string[] = ['read', 'execute'];
          const rawLower = raw.toLowerCase();

          if (rawLower.includes('write-all') || rawLower.includes('contents: write')) {
            permissions.push('write');
          }
          if (rawLower.includes('deploy') || rawLower.includes('upload') || rawLower.includes('curl')) {
            permissions.push('network');
          }
          if (rawLower.includes('id-token: write') || rawLower.includes('security-events: write')) {
            permissions.push('admin');
          }

          tools.push({
            id: `ci-${file.replace(/\./g, '-')}`,
            name: `ci:${workflowName}`,
            description: `GitHub Actions workflow file: ${file}`,
            endpoint: 'github-actions',
            permissions: Array.from(new Set(permissions)),
            execution: {
              enabled: true,
              command: `gh workflow run ${file}`,
              isolated: true
            },
            metadata: {
              sourceFile: `.github/workflows/${file}`,
              workflowName
            }
          });
        } catch (e) {
          console.warn(`[ToolGuard] Failed to parse workflow file ${filePath}:`, e);
        }
      }
    } catch {
      // Ignore
    }

    return tools;
  }
}
