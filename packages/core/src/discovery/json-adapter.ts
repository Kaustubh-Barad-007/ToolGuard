import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '@toolguard/shared';
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
            const content = await fs.readFile(fullPath, 'utf8');
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item && typeof item === 'object' && item.name) {
                  tools.push({
                    id: item.id || item.name,
                    ...item
                  });
                }
              }
            } else if (parsed && typeof parsed === 'object' && parsed.name) {
              tools.push({
                id: parsed.id || parsed.name,
                ...parsed
              });
            }
          } catch (e) {
            console.warn(`[ToolGuard] Failed to parse tool file ${fullPath}:`, e);
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
        const content = await fs.readFile(file, 'utf8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && typeof item === 'object' && item.name) {
              tools.push({
                id: item.id || item.name,
                ...item
              });
            }
          }
        }
      } catch {
        // File does not exist or unreadable
      }
    }

    return tools;
  }
}
