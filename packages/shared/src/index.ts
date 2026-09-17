export * from './types/index.js';
export * from './schemas/index.js';
export * from './constants/index.js';

/**
 * Strips UTF-8 Byte Order Mark (BOM) (\uFEFF) from strings,
 * common when files are written by Windows PowerShell or certain editors.
 */
export function stripBom(str: string): string {
  if (typeof str !== 'string') return str;
  if (str.charCodeAt(0) === 0xFEFF) {
    return str.slice(1);
  }
  return str;
}

