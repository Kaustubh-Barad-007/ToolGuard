import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  GenericJsonAdapter,
  PackageJsonAdapter,
  PythonProjectAdapter,
  MakefileAdapter,
  VSCodeTasksAdapter,
  discoverWorkspaceTools
} from '../packages/core/src/node';

describe('ToolGuard Multi-Ecosystem Adapters', () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'toolguard-test-'));
  });

  afterAll(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Cleanup best effort
    }
  });

  describe('PackageJsonAdapter', () => {
    it('should discover npm scripts and infer permissions accurately', async () => {
      const pkgPath = path.join(tmpDir, 'package.json');
      await fs.writeFile(
        pkgPath,
        JSON.stringify({
          name: 'sample-project',
          scripts: {
            dev: 'vite',
            build: 'vite build && rm -rf dist/old',
            deploy: 'curl -X POST https://api.example.com/deploy'
          }
        }),
        'utf8'
      );

      const adapter = new PackageJsonAdapter();
      expect(await adapter.detect(tmpDir)).toBe(true);

      const tools = await adapter.discover(tmpDir);
      expect(tools.length).toBe(3);

      const devTool = tools.find(t => t.name === 'npm:dev');
      expect(devTool).toBeDefined();
      expect(devTool?.permissions).toContain('execute');

      const buildTool = tools.find(t => t.name === 'npm:build');
      expect(buildTool?.permissions).toContain('write');

      const deployTool = tools.find(t => t.name === 'npm:deploy');
      expect(deployTool?.permissions).toContain('network');
    });
  });

  describe('PythonProjectAdapter', () => {
    it('should discover Python pyproject.toml scripts and requirements.txt tools', async () => {
      const pyproject = `
[project]
name = "ai-service"

[project.scripts]
serve = "service.app:run_server"
cli = "service.cli:main"
`;
      await fs.writeFile(path.join(tmpDir, 'pyproject.toml'), pyproject, 'utf8');

      const requirements = `
pytest>=7.0.0
uvicorn==0.23.0
celery==5.3.0
`;
      await fs.writeFile(path.join(tmpDir, 'requirements.txt'), requirements, 'utf8');

      const adapter = new PythonProjectAdapter();
      expect(await adapter.detect(tmpDir)).toBe(true);

      const tools = await adapter.discover(tmpDir);
      expect(tools.some(t => t.name === 'python:serve')).toBe(true);
      expect(tools.some(t => t.name === 'python:pytest')).toBe(true);
      expect(tools.some(t => t.name === 'python:uvicorn')).toBe(true);
    });
  });

  describe('MakefileAdapter', () => {
    it('should discover Makefile targets and parse execution recipes', async () => {
      const makefile = `
.PHONY: all build test clean

build:
\tgo build -o bin/app main.go

test:
\tgo test ./...

deploy:
\tcurl -s https://deploy.internal/api

clean:
\trm -rf bin/
`;
      await fs.writeFile(path.join(tmpDir, 'Makefile'), makefile, 'utf8');

      const adapter = new MakefileAdapter();
      expect(await adapter.detect(tmpDir)).toBe(true);

      const tools = await adapter.discover(tmpDir);
      expect(tools.length).toBeGreaterThanOrEqual(4);

      const cleanTool = tools.find(t => t.name === 'make:clean');
      expect(cleanTool?.permissions).toContain('write');

      const deployTool = tools.find(t => t.name === 'make:deploy');
      expect(deployTool?.permissions).toContain('network');
    });
  });

  describe('VSCodeTasksAdapter', () => {
    it('should discover .vscode/tasks.json configurations', async () => {
      const vscodeDir = path.join(tmpDir, '.vscode');
      await fs.mkdir(vscodeDir, { recursive: true });
      await fs.writeFile(
        path.join(vscodeDir, 'tasks.json'),
        JSON.stringify({
          version: '2.0.0',
          tasks: [
            {
              label: 'compile-kernel',
              type: 'shell',
              command: 'cargo build --release'
            }
          ]
        }),
        'utf8'
      );

      const adapter = new VSCodeTasksAdapter();
      expect(await adapter.detect(tmpDir)).toBe(true);

      const tools = await adapter.discover(tmpDir);
      expect(tools.some(t => t.name === 'vscode:compile-kernel')).toBe(true);
    });
  });

  describe('GenericJsonAdapter (BOM & Tampering Resilience)', () => {
    it('should parse tool files with UTF-8 BOM (Byte Order Mark) without throwing SyntaxError', async () => {
      const toolsDir = path.join(tmpDir, '.toolguard', 'tools');
      await fs.mkdir(toolsDir, { recursive: true });

      // Write tool definition with UTF-8 BOM (\uFEFF)
      const bomContent = '\uFEFF' + JSON.stringify({
        id: 'bom-test-tool',
        name: 'bom-test-tool',
        description: 'Tool written with UTF-8 BOM by Windows PowerShell',
        permissions: ['read', 'network'],
        endpoint: 'local'
      }, null, 2);

      const toolFilePath = path.join(toolsDir, 'bom-test-tool.json');
      await fs.writeFile(toolFilePath, bomContent, 'utf8');

      const adapter = new GenericJsonAdapter();
      expect(await adapter.detect(tmpDir)).toBe(true);

      const tools = await adapter.discover(tmpDir);
      const bomTool = tools.find(t => t.name === 'bom-test-tool');
      expect(bomTool).toBeDefined();
      expect(bomTool?.permissions).toContain('network');
    });

    it('should flag corrupted or malformed tool JSON files as high-risk corrupted tools', async () => {
      const toolsDir = path.join(tmpDir, '.toolguard', 'tools');
      const corruptedFilePath = path.join(toolsDir, 'malformed-tool.json');
      // Malformed, invalid JSON
      await fs.writeFile(corruptedFilePath, '{ "id": "malformed", broken syntax }', 'utf8');

      const adapter = new GenericJsonAdapter();
      const tools = await adapter.discover(tmpDir);
      const corruptedTool = tools.find(t => t.id === 'corrupted:malformed-tool');
      expect(corruptedTool).toBeDefined();
      expect(corruptedTool?.permissions).toContain('admin');
      expect(corruptedTool?.permissions).toContain('network');
    });
  });

  describe('Universal Discovery', () => {
    it('should discover all tools across all adapters without duplicates', async () => {
      const allTools = await discoverWorkspaceTools(tmpDir);
      expect(allTools.length).toBeGreaterThan(5);

      const ids = allTools.map(t => t.id || t.name);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
