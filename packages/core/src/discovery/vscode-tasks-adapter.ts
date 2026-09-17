import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition, stripBom } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class VSCodeTasksAdapter implements ToolAdapter {
  readonly name = 'VS Code Workspace Tasks Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const tasksFile = path.join(workspacePath, '.vscode', 'tasks.json');
    try {
      const stat = await fs.stat(tasksFile);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const tasksFile = path.join(workspacePath, '.vscode', 'tasks.json');
    const tools: ToolDefinition[] = [];

    try {
      const content = await fs.readFile(tasksFile, 'utf8');
      // Clean comments if JSON with comments (jsonc) and strip BOM
      const cleanJson = stripBom(content).replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

      for (const t of tasks) {
        if (!t.label && !t.taskName) continue;
        const label = t.label || t.taskName;
        const command = t.command || '';
        const args = Array.isArray(t.args) ? t.args.join(' ') : (t.args || '');
        const fullCmd = `${command} ${args}`.trim();
        const cmdLower = fullCmd.toLowerCase();

        const permissions: string[] = ['read', 'execute'];

        if (
          cmdLower.includes('rm ') ||
          cmdLower.includes('del ') ||
          cmdLower.includes('clean') ||
          cmdLower.includes('mkdir') ||
          cmdLower.includes('build')
        ) {
          permissions.push('write');
        }

        if (
          cmdLower.includes('http://') ||
          cmdLower.includes('https://') ||
          cmdLower.includes('curl') ||
          cmdLower.includes('wget') ||
          cmdLower.includes('publish') ||
          cmdLower.includes('deploy')
        ) {
          permissions.push('network');
        }

        if (cmdLower.includes('sudo ') || cmdLower.includes('admin')) {
          permissions.push('admin');
        }

        tools.push({
          id: `vscode-task-${label.replace(/[^a-zA-Z0-9_\-]/g, '_')}`,
          name: `vscode:${label}`,
          description: `VS Code Task "${label}": ${fullCmd || t.type}`,
          endpoint: 'local',
          permissions: Array.from(new Set(permissions)),
          execution: {
            enabled: true,
            command: fullCmd || label,
            isolated: false
          },
          metadata: {
            sourceFile: '.vscode/tasks.json',
            taskType: t.type || 'shell',
            group: t.group
          }
        });
      }
    } catch {
      // Error reading or parsing tasks.json
    }

    return tools;
  }
}
