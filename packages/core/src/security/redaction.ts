/**
 * ToolGuard Secret Redaction Engine
 *
 * Scans object trees for known sensitive credential property names and masks
 * them with '[REDACTED]' before saving to baseline or logging.
 *
 * LIMITATIONS:
 * 1. Pattern matching is heuristic based on key names and common token prefixes.
 * 2. Unlabeled secrets embedded inside arbitrary text strings or code may not be caught.
 * 3. Never rely on redaction as a substitute for keeping secrets out of tool definitions entirely.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /apikey/i,
  /api_key/i,
  /authorization/i,
  /privatekey/i,
  /private_key/i,
  /credential/i,
  /client_secret/i,
  /access_key/i
];

/**
 * Checks whether a property name indicates sensitive credential information.
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Recursively redacts sensitive values from an object or array.
 */
export function redactSensitiveData<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => redactSensitiveData(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
      if (isSensitiveKey(k)) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = redactSensitiveData(v);
      }
    }

    return sanitized as T;
  }

  // Primitive strings that look like Bearer tokens or private keys
  if (typeof input === 'string') {
    if (/^(Bearer\s+[a-zA-Z0-9_\-\.]{15,}|ghp_[a-zA-Z0-9]{36}|sk-[a-zA-Z0-9]{32,})$/.test(input.trim())) {
      return '[REDACTED]' as unknown as T;
    }
  }

  return input;
}
