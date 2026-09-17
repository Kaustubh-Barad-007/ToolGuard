import { sha256 } from 'js-sha256';
import stringify from 'fast-json-stable-stringify';
import { Fingerprint, NormalizedToolDefinition } from '@toolguard/shared';

/**
 * Computes a deterministic SHA-256 fingerprint from a normalized tool definition.
 * Uses canonical JSON serialization + SHA-256 digest. Works across Node and Browser.
 */
export function computeFingerprint(normalized: NormalizedToolDefinition): Fingerprint {
  const canonicalJson = stringify(normalized);
  const hash = sha256(canonicalJson);

  return {
    algorithm: 'SHA-256',
    hash,
    canonicalJson
  };
}

/**
 * Computes a raw SHA-256 hash string for any arbitrary object using canonical serialization.
 */
export function hashCanonicalObject(obj: unknown): string {
  const canonical = stringify(obj);
  return sha256(canonical);
}
