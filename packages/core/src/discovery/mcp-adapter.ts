import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '@toolguard/shared';
import { ToolAdapter } from './adapter.js';

const CANDIDATE_MCP_FILES = (workspacePath: string) => [
  path.join(workspacePath, '.cursor', 'mcp.json'),
  path.join(workspacePath, 'mcp.json'),
  path.join(workspacePath, '.toolguard', 'mcp.json'),
  path.join(workspacePath, '.vscode', 'mcp.json'),
  path.join(workspacePath, '.windsurf', 'mcp_config.json'),
  path.join(workspacePath, '.codeium', 'windsurf', 'mcp_config.json'),
  path.join(workspacePath, 'cline_mcp_settings.json'),
  path.join(workspacePath, '.cline', 'mcp_settings.json'),
  path.join(workspacePath, '.roo', 'mcp_settings.json')
];

export class McpToolAdapter implements ToolAdapter {
  readonly name = 'Model Context Protocol (MCP) Adapter';

  async detect(workspacePath: string): Promise<boolean> {
    for (const file of CANDIDATE_MCP_FILES(workspacePath)) {
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

    for (const file of CANDIDATE_MCP_FILES(workspacePath)) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const parsed = JSON.parse(content);
        const servers = parsed.mcpServers || parsed.servers || {};

        for (const [serverName, serverConfig] of Object.entries<any>(servers)) {
          const command = serverConfig.command || '';
          const args = serverConfig.args || [];
          const permissions: string[] = ['execute'];
          if (command.includes('node') || command.includes('python') || command.includes('sh')) {
            permissions.push('read');
          }

          tools.push({
            id: `mcp-${serverName}`,
            name: serverName,
            description: `MCP Server: ${serverName} executing ${command}`,
            endpoint: serverConfig.url || 'stdio',
            permissions,
            execution: {
              enabled: true,
              command: `${command} ${args.join(' ')}`.trim(),
              isolated: false
            },
            metadata: {
              source: 'mcp',
              file: path.relative(workspacePath, file)
            }
          });
        }
      } catch {
        // Continue to next candidate
      }
    }

    return tools;
  }
}
