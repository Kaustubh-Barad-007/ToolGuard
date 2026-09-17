import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition, stripBom } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class PackageJsonAdapter implements ToolAdapter {
  readonly name = 'Package.json Script & Tool Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const pkgPath = path.join(workspacePath, 'package.json');
    try {
      const stat = await fs.stat(pkgPath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const pkgPath = path.join(workspacePath, 'package.json');
    const tools: ToolDefinition[] = [];

    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(stripBom(raw).trim());
      const scripts = pkg.scripts || {};

      for (const [scriptName, scriptCmd] of Object.entries<string>(scripts)) {
        if (!scriptCmd || typeof scriptCmd !== 'string') continue;

        const permissions: string[] = ['read', 'execute'];
        const cmdLower = scriptCmd.toLowerCase();

        // Detect write capabilities
        if (
          cmdLower.includes('rm ') ||
          cmdLower.includes('del ') ||
          cmdLower.includes('rimraf') ||
          cmdLower.includes('mkdir') ||
          cmdLower.includes('cp ') ||
          cmdLower.includes('mv ') ||
          cmdLower.includes('clean') ||
          cmdLower.includes('build') ||
          cmdLower.includes('dist')
        ) {
          permissions.push('write');
        }

        // Detect network capabilities
        if (
          cmdLower.includes('curl ') ||
          cmdLower.includes('wget ') ||
          cmdLower.includes('fetch') ||
          cmdLower.includes('http://') ||
          cmdLower.includes('https://') ||
          cmdLower.includes('publish') ||
          cmdLower.includes('deploy') ||
          cmdLower.includes('git push')
        ) {
          permissions.push('network');
        }

        // Detect administrative execution
        if (cmdLower.includes('sudo ') || cmdLower.includes('admin')) {
          permissions.push('admin');
        }

        tools.push({
          id: `npm-${scriptName}`,
          name: `npm:${scriptName}`,
          description: `Package script "${scriptName}": ${scriptCmd}`,
          endpoint: 'local',
          permissions: Array.from(new Set(permissions)),
          execution: {
            enabled: true,
            command: scriptCmd,
            isolated: false
          },
          metadata: {
            sourceFile: 'package.json',
            scriptName,
            rawCommand: scriptCmd
          }
        });
      }
    } catch (err: any) {
      console.warn(`[ToolGuard] Failed to parse package.json at ${pkgPath}:`, err.message);
      tools.push({
        id: 'npm:package-json:corrupted',
        name: 'package.json (malformed)',
        description: `CRITICAL: package.json failed to parse: ${err.message}`,
        permissions: ['admin', 'execute'],
        endpoint: 'corrupted-file',
        execution: { enabled: true, command: '[INVALID JSON IN PACKAGE.JSON]' }
      });
    }

    return tools;
  }
}
