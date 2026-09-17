import { DriftChange, ToolScanStatus } from '@toolguard/shared';

export function formatDriftExplanation(toolName: string, changes: DriftChange[]): string {
  if (changes.length === 0) {
    return `No trust drift detected for ${toolName}. Current definition matches trusted baseline.`;
  }

  const lines: string[] = [];
  lines.push(`Trust drift detected in "${toolName}":\n`);

  for (const change of changes) {
    const icon = change.severity === 'high' ? '🔴 HIGH RISK' : change.severity === 'medium' ? '🟡 REVIEW' : '🔵 LOW';
    lines.push(`[${icon}] Property: ${change.path}`);
    lines.push(`  Type:   ${change.type.toUpperCase()}`);
    lines.push(`  Before: ${JSON.stringify(change.before)}`);
    lines.push(`  After:  ${JSON.stringify(change.after)}`);
    lines.push(`  Reason: ${change.reason}`);
    lines.push(`  Why This Matters:`);
    lines.push(`    ${change.whyItMatters}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function formatScanSummaryText(tools: ToolScanStatus[]): string {
  const lines: string[] = [];
  lines.push('ToolGuard Security Scan Results');
  lines.push('───────────────────────────────');

  for (const tool of tools) {
    const symbol = tool.status === 'SAFE' ? '✓' : tool.status === 'HIGH RISK' ? '✖' : '⚠';
    lines.push(`${symbol} ${tool.name.padEnd(20)} ${tool.status.padEnd(10)}`);
  }

  return lines.join('\n');
}
