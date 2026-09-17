import { ToolDefinition, NormalizedToolDefinition, ToolAuthentication, ToolExecution } from '@toolguard/shared';

/**
 * Normalizes values recursively.
 * - Object keys are sorted alphabetically.
 * - Arrays with unordered semantic types (like permissions, scopes, tags) are sorted.
 * - String paths or whitespace are trimmed and canonicalized.
 */
export function normalizeValue(val: unknown, keyName?: string): unknown {
  if (val === null || val === undefined) {
    return val;
  }

  if (Array.isArray(val)) {
    const normalizedItems = val.map(item => normalizeValue(item));
    // Check if this array represents an unordered set of values
    const unorderedKeyNames = ['permissions', 'scopes', 'tags', 'roles', 'allowedOrigins'];
    if (keyName && unorderedKeyNames.includes(keyName)) {
      return [...normalizedItems].sort((a, b) => {
        const strA = typeof a === 'string' ? a : JSON.stringify(a);
        const strB = typeof b === 'string' ? b : JSON.stringify(b);
        return strA.localeCompare(strB);
      });
    }
    return normalizedItems;
  }

  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const result: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      result[key] = normalizeValue(obj[key], key);
    }
    return result;
  }

  if (typeof val === 'string') {
    // Canonicalize path slashes if looks like file path
    let s = val.trim();
    if (keyName === 'endpoint' || keyName === 'command' || keyName === 'path') {
      s = s.replace(/\\/g, '/');
    }
    return s;
  }

  return val;
}

/**
 * Normalizes a ToolDefinition into a deterministic NormalizedToolDefinition.
 */
export function normalizeToolDefinition(raw: ToolDefinition): NormalizedToolDefinition {
  const permissions = Array.isArray(raw.permissions)
    ? [...new Set(raw.permissions.map(p => String(p).trim().toLowerCase()))].sort()
    : [];

  const authentication: ToolAuthentication = {
    required: Boolean(raw.authentication?.required),
    type: raw.authentication?.type ? String(raw.authentication.type).trim().toLowerCase() : undefined,
    scopes: Array.isArray(raw.authentication?.scopes)
      ? [...new Set(raw.authentication.scopes.map(s => String(s).trim()))].sort()
      : undefined
  };

  const execution: ToolExecution = {
    enabled: Boolean(raw.execution?.enabled),
    command: raw.execution?.command ? String(raw.execution.command).trim().replace(/\\/g, '/') : undefined,
    isolated: raw.execution?.isolated !== undefined ? Boolean(raw.execution.isolated) : undefined,
    shell: raw.execution?.shell !== undefined ? Boolean(raw.execution.shell) : undefined,
    timeoutMs: typeof raw.execution?.timeoutMs === 'number' ? raw.execution.timeoutMs : undefined
  };

  const inputSchema = raw.inputSchema && typeof raw.inputSchema === 'object'
    ? (normalizeValue(raw.inputSchema) as Record<string, unknown>)
    : {};

  const outputSchema = raw.outputSchema && typeof raw.outputSchema === 'object'
    ? (normalizeValue(raw.outputSchema) as Record<string, unknown>)
    : {};

  const metadata = raw.metadata && typeof raw.metadata === 'object'
    ? (normalizeValue(raw.metadata) as Record<string, unknown>)
    : {};

  // Preserve any extra custom properties in sorted order
  const standardKeys = new Set([
    'id',
    'name',
    'description',
    'version',
    'permissions',
    'endpoint',
    'inputSchema',
    'outputSchema',
    'authentication',
    'execution',
    'metadata'
  ]);

  const extra: Record<string, unknown> = {};
  for (const key of Object.keys(raw).sort()) {
    if (!standardKeys.has(key)) {
      extra[key] = normalizeValue(raw[key], key);
    }
  }

  return {
    name: String(raw.name || '').trim(),
    description: String(raw.description || '').trim(),
    version: String(raw.version || '1.0.0').trim(),
    permissions,
    endpoint: raw.endpoint ? String(raw.endpoint).trim().replace(/\\/g, '/') : '',
    inputSchema,
    outputSchema,
    authentication,
    execution,
    metadata,
    extra
  };
}
