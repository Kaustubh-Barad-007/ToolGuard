import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition, stripBom } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class GenericJsonAdapter implements ToolAdapter {
  readonly name = 'Generic JSON Tool Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const candidateDirs = [
      path.join(workspacePath, '.toolguard', 'tools'),
      path.join(workspacePath, 'tools'),
      path.join(workspacePath, '.tools')
    ];

    for (const dir of candidateDirs) {
      try {
        const stat = await fs.stat(dir);
        if (stat.isDirectory()) {
          const files = await fs.readdir(dir);
          if (files.some(f => f.endsWith('.json'))) {
            return true;
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    // Check single tool files
    const singleFiles = [
      path.join(workspacePath, 'toolguard-tools.json'),
      path.join(workspacePath, '.toolguard-tools.json')
    ];

    for (const file of singleFiles) {
      try {
        const stat = await fs.stat(file);
        if (stat.isFile()) return true;
      } catch {
        // File doesn't exist
      }
    }

    return false;
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const tools: ToolDefinition[] = [];
    const candidateDirs = [
      path.join(workspacePath, '.toolguard', 'tools'),
      path.join(workspacePath, 'tools'),
      path.join(workspacePath, '.tools')
    ];

    for (const dir of candidateDirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const fullPath = path.join(dir, file);
          try {
            const raw = await fs.readFile(fullPath, 'utf8');
            const content = stripBom(raw).trim();
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item && typeof item === 'object') {
                  const toolName = item.name || item.id || path.basename(file, '.json');
                  tools.push({
                    id: item.id || toolName,
                    name: toolName,
                    ...item
                  });
                }
              }
            } else if (parsed && typeof parsed === 'object') {
              const toolName = parsed.name || parsed.id || path.basename(file, '.json');
              tools.push({
                id: parsed.id || toolName,
                name: toolName,
                ...parsed
              });
            }
          } catch (e: any) {
            // Do not silently swallow parse errors; register as high-risk corrupted tool
            const baseName = path.basename(file, '.json');
            tools.push({
              id: `corrupted:${baseName}`,
              name: `corrupted:${baseName}`,
              description: `CRITICAL: Tool definition ${file} failed to parse or is malformed (${e.message})`,
              permissions: ['admin', 'execute', 'network'],
              endpoint: 'corrupted-file',
              execution: {
                enabled: true,
                command: `[MALFORMED JSON IN ${file}]`,
                isolated: false
              }
            });
            console.warn(`[ToolGuard] Registered corrupted tool file ${fullPath}:`, e.message);
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    const singleFiles = [
      path.join(workspacePath, 'toolguard-tools.json'),
      path.join(workspacePath, '.toolguard-tools.json')
    ];

    for (const file of singleFiles) {
      try {
        const raw = await fs.readFile(file, 'utf8');
        const content = stripBom(raw).trim();
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && typeof item === 'object') {
              const toolName = item.name || item.id || path.basename(file, '.json');
              tools.push({
                id: item.id || toolName,
                name: toolName,
                ...item
              });
            }
          }
        } else if (parsed && typeof parsed === 'object') {
          const toolName = parsed.name || parsed.id || path.basename(file, '.json');
          tools.push({
            id: parsed.id || toolName,
            name: toolName,
            ...parsed
          });
        }
      } catch {
        // File does not exist or unreadable
      }
    }

    return tools;
  }
}
