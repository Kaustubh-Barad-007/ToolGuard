import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

export class PythonProjectAdapter implements ToolAdapter {
  readonly name = 'Python Project & Agent Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    const candidateFiles = [
      path.join(workspacePath, 'pyproject.toml'),
      path.join(workspacePath, 'requirements.txt'),
      path.join(workspacePath, 'Pipfile'),
      path.join(workspacePath, 'setup.py')
    ];

    for (const file of candidateFiles) {
      try {
        const stat = await fs.stat(file);
        if (stat.isFile()) return true;
      } catch {
        // Continue
      }
    }
    return false;
  }

  async discover(workspacePath: string): Promise<ToolDefinition[]> {
    const tools: ToolDefinition[] = [];
    const seen = new Set<string>();

    // 1. Check pyproject.toml
    const pyprojectPath = path.join(workspacePath, 'pyproject.toml');
    try {
      const content = await fs.readFile(pyprojectPath, 'utf8');
      const lines = content.split(/\r?\n/);
      let inScriptsSection = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          inScriptsSection = trimmed === '[project.scripts]' || trimmed === '[tool.poetry.scripts]';
          continue;
        }

        if (inScriptsSection && trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [scriptName, scriptTarget] = trimmed.split('=').map(s => s.trim().replace(/^["']|["']$/g, ''));
          if (scriptName && !seen.has(scriptName)) {
            seen.add(scriptName);
            const permissions = ['read', 'execute'];
            const targetLower = (scriptTarget || '').toLowerCase();
            if (targetLower.includes('server') || targetLower.includes('api') || targetLower.includes('web')) {
              permissions.push('network');
            }
            if (targetLower.includes('write') || targetLower.includes('save') || targetLower.includes('db')) {
              permissions.push('write');
            }

            tools.push({
              id: `python-${scriptName}`,
              name: `python:${scriptName}`,
              description: `Python script "${scriptName}" -> ${scriptTarget}`,
              endpoint: 'local',
              permissions: Array.from(new Set(permissions)),
              execution: {
                enabled: true,
                command: `python -m ${scriptTarget}`,
                isolated: false
              },
              metadata: {
                sourceFile: 'pyproject.toml',
                scriptTarget
              }
            });
          }
        }
      }
    } catch {
      // pyproject.toml not found or not readable
    }

    // 2. Check requirements.txt
    const reqPath = path.join(workspacePath, 'requirements.txt');
    try {
      const content = await fs.readFile(reqPath, 'utf8');
      const lines = content.split(/\r?\n/);

      // Identify key CLI / runner tools
      const knownTools = [
        { name: 'pytest', desc: 'Python test runner', perms: ['read', 'execute'], write: false, net: false },
        { name: 'uvicorn', desc: 'ASGI web server', perms: ['read', 'execute', 'network'], write: false, net: true },
        { name: 'gunicorn', desc: 'WSGI web server', perms: ['read', 'execute', 'network'], write: false, net: true },
        { name: 'celery', desc: 'Distributed task queue', perms: ['read', 'execute', 'network', 'write'], write: true, net: true },
        { name: 'ruff', desc: 'Python linter & code formatter', perms: ['read', 'write', 'execute'], write: true, net: false },
        { name: 'black', desc: 'Python code formatter', perms: ['read', 'write', 'execute'], write: true, net: false },
        { name: 'mypy', desc: 'Static type checker', perms: ['read', 'execute'], write: false, net: false },
        { name: 'langchain', desc: 'LLM Agent framework', perms: ['read', 'execute', 'network'], write: false, net: true },
        { name: 'crewai', desc: 'Multi-agent orchestration framework', perms: ['read', 'execute', 'network'], write: false, net: true }
      ];

      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

        for (const kt of knownTools) {
          if ((trimmed.startsWith(kt.name + '==') || trimmed.startsWith(kt.name + '>=') || trimmed === kt.name) && !seen.has(kt.name)) {
            seen.add(kt.name);
            tools.push({
              id: `python-tool-${kt.name}`,
              name: `python:${kt.name}`,
              description: kt.desc,
              endpoint: 'local',
              permissions: kt.perms,
              execution: {
                enabled: true,
                command: kt.name,
                isolated: false
              },
              metadata: {
                sourceFile: 'requirements.txt',
                package: kt.name
              }
            });
          }
        }
      }
    } catch {
      // requirements.txt not found
    }

    return tools;
  }
}
