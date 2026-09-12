import * as OpenCC from 'opencc-js';

/**
 * Traditional → Simplified conversion, run at build time only.
 *
 * The site keeps one Chinese source of truth (Traditional, `zh-hant`) and
 * derives the Simplified pages from it. `tw` → `cn` is a phrase-level
 * conversion, not a character swap, so it also fixes vocabulary that
 * genuinely differs between Taiwan and the mainland
 * (資訊 → 信息, 程式 → 程序, 軟體 → 软件).
 *
 * Nothing from this file reaches the browser — Astro renders it away.
 */
const convert = OpenCC.Converter({ from: 'tw', to: 'cn' });

export function toHans(input: string): string {
  return convert(input);
}

/** Convert every string in a nested object / array, leaving other values alone. */
export function deepHans<T>(value: T): T {
  if (typeof value === 'string') return toHans(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepHans(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepHans(v);
    }
    return out as T;
  }
  return value;
}
