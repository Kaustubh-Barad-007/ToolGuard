import { NormalizedToolDefinition } from '@toolguard/shared';

export interface RawDiffChange {
  path: string;
  type: 'added' | 'removed' | 'changed';
  before?: unknown;
  after?: unknown;
}

/**
 * Deeply compares two objects and outputs property-level changes.
 */
export function deepDiff(
  beforeObj: Record<string, unknown>,
  afterObj: Record<string, unknown>,
  prefix = ''
): RawDiffChange[] {
  const changes: RawDiffChange[] = [];
  const allKeys = new Set([...Object.keys(beforeObj || {}), ...Object.keys(afterObj || {})]);

  for (const key of allKeys) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    const beforeVal = beforeObj ? beforeObj[key] : undefined;
    const afterVal = afterObj ? afterObj[key] : undefined;

    if (beforeVal === undefined && afterVal !== undefined) {
      changes.push({
        path: currentPath,
        type: 'added',
        after: afterVal
      });
    } else if (beforeVal !== undefined && afterVal === undefined) {
      changes.push({
        path: currentPath,
        type: 'removed',
        before: beforeVal
      });
    } else if (Array.isArray(beforeVal) && Array.isArray(afterVal)) {
      const beforeStr = JSON.stringify(beforeVal);
      const afterStr = JSON.stringify(afterVal);
      if (beforeStr !== afterStr) {
        changes.push({
          path: currentPath,
          type: 'changed',
          before: beforeVal,
          after: afterVal
        });
      }
    } else if (
      typeof beforeVal === 'object' &&
      beforeVal !== null &&
      typeof afterVal === 'object' &&
      afterVal !== null
    ) {
      const nested = deepDiff(
        beforeVal as Record<string, unknown>,
        afterVal as Record<string, unknown>,
        currentPath
      );
      changes.push(...nested);
    } else if (beforeVal !== afterVal) {
      changes.push({
        path: currentPath,
        type: 'changed',
        before: beforeVal,
        after: afterVal
      });
    }
  }

  return changes;
}

/**
 * Compares two normalized tool definitions and returns structured changes.
 */
export function diffToolDefinitions(
  baseline: NormalizedToolDefinition,
  current: NormalizedToolDefinition
): RawDiffChange[] {
  return deepDiff(
    baseline as unknown as Record<string, unknown>,
    current as unknown as Record<string, unknown>
  );
}
