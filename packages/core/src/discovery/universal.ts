import { ToolDefinition } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';
import { GenericJsonAdapter } from './json-adapter.js';
import { McpToolAdapter } from './mcp-adapter.js';
import { PackageJsonAdapter } from './package-json-adapter.js';
import { WorkflowAdapter } from './workflow-adapter.js';
import { PythonProjectAdapter } from './python-adapter.js';
import { MakefileAdapter } from './makefile-adapter.js';
import { VSCodeTasksAdapter } from './vscode-tasks-adapter.js';

export function createUniversalAdapters(): ToolAdapter[] {
  return [
    new GenericJsonAdapter(),
    new McpToolAdapter(),
    new PackageJsonAdapter(),
    new PythonProjectAdapter(),
    new MakefileAdapter(),
    new VSCodeTasksAdapter(),
    new WorkflowAdapter()
  ];
}

/**
 * Universally discover tools across any workspace regardless of stack
 * (Node, Python, Go, C/Rust Makefile, GitHub Workflows, VS Code Tasks, or MCP agent configs)
 */
export async function discoverWorkspaceTools(workspacePath: string): Promise<ToolDefinition[]> {
  const adapters = createUniversalAdapters();
  const allTools: ToolDefinition[] = [];
  const seen = new Set<string>();

  for (const adapter of adapters) {
    try {
      const detected = await adapter.detect(workspacePath);
      if (detected) {
        const tools = await adapter.discover(workspacePath);
        for (const t of tools) {
          const id = t.id || t.name;
          if (!seen.has(id)) {
            seen.add(id);
            allTools.push(t);
          }
        }
      }
    } catch (err) {
      // Individual adapter failure shouldn't crash discovery
      console.error(`[ToolGuard] Discovery warning for ${adapter.name}:`, err);
    }
  }

  return allTools;
}
