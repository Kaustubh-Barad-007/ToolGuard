import { ToolDefinition } from '@toolguard/shared';

export interface ToolAdapter {
  readonly name: string;
  detect(workspacePath: string): Promise<boolean>;
  discover(workspacePath: string): Promise<ToolDefinition[]>;
}
