import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class MakefileAdapter implements ToolAdapter {
  readonly name = 'Makefile Target Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const candidates = ['Makefile', 'makefile', 'GNUmakefile'];
    for (const name of candidates) {
      try {
        const stat = await fs.stat(path.join(workspacePath, name));
        if (stat.isFile()) return true;
      } catch {
        // Continue
      }
    }
    return false;
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const candidates = ['Makefile', 'makefile', 'GNUmakefile'];
    let makefilePath: string | null = null;
    let makefileName = 'Makefile';

    for (const name of candidates) {
      const fullPath = path.join(workspacePath, name);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          makefilePath = fullPath;
          makefileName = name;
          break;
        }
      } catch {
        // Continue
      }
    }

    if (!makefilePath) return [];

    const tools: ToolDefinition[] = [];
    try {
      const content = await fs.readFile(makefilePath, 'utf8');
      const lines = content.split(/\r?\n/);

      let currentTarget: string | null = null;
      let currentCommands: string[] = [];

      const flushTarget = () => {
        if (!currentTarget || currentTarget.startsWith('.')) return;

        const combinedCmd = currentCommands.join(' && ').trim();
        const cmdLower = combinedCmd.toLowerCase();
        const permissions: string[] = ['read', 'execute'];

        if (
          cmdLower.includes('rm ') ||
          cmdLower.includes('del ') ||
          cmdLower.includes('mkdir') ||
          cmdLower.includes('cp ') ||
          cmdLower.includes('mv ') ||
          cmdLower.includes('build') ||
          cmdLower.includes('clean') ||
          cmdLower.includes('sed ')
        ) {
          permissions.push('write');
        }

        if (
          cmdLower.includes('curl ') ||
          cmdLower.includes('wget ') ||
          cmdLower.includes('http://') ||
          cmdLower.includes('https://') ||
          cmdLower.includes('docker push') ||
          cmdLower.includes('git push') ||
          cmdLower.includes('ssh ')
        ) {
          permissions.push('network');
        }

        if (cmdLower.includes('sudo ') || cmdLower.includes('chmod ') || cmdLower.includes('chown ')) {
          permissions.push('admin');
        }

        tools.push({
          id: `make-${currentTarget}`,
          name: `make:${currentTarget}`,
          description: `Makefile target "${currentTarget}": ${combinedCmd || 'make ' + currentTarget}`,
          endpoint: 'local',
          permissions: Array.from(new Set(permissions)),
          execution: {
            enabled: true,
            command: `make ${currentTarget}`,
            isolated: false
          },
          metadata: {
            sourceFile: makefileName,
            target: currentTarget,
            recipe: combinedCmd
          }
        });
      };

      for (const line of lines) {
        // Check if this line is an indented command (starts with tab or spaces)
        if (line.startsWith('\t') || line.startsWith('    ')) {
          if (currentTarget) {
            currentCommands.push(line.trim());
          }
          continue;
        }

        // Check if this is a target declaration (e.g. `build: ...` or `test:`)
        const targetMatch = line.match(/^([a-zA-Z0-9_\-\.]+):(?!\=)/);
        if (targetMatch) {
          flushTarget();
          currentTarget = targetMatch[1];
          currentCommands = [];
        } else if (line.trim().length > 0 && !line.startsWith('#')) {
          // Some other make construct (variable assignment, condition)
          flushTarget();
          currentTarget = null;
          currentCommands = [];
        }
      }

      flushTarget();
    } catch {
      // Error reading Makefile
    }

    return tools;
  }
}
