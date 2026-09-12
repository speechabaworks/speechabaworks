/**
 * Generate the Simplified Chinese content from the Traditional.
 *
 *   npm run sync:hans
 *
 * Every `src/content/<collection>/zh-hant/*.md` gets a counterpart in
 * `zh-hans/`, converted phrase-by-phrase (Taiwan → mainland), so vocabulary
 * differences are handled and not just the characters.
 *
 * Files already in zh-hans are left alone unless --force is passed, so any
 * hand-corrections Linda makes in the CMS survive the next sync.
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const convert = OpenCC.Converter({ from: 'tw', to: 'cn' });
/* fileURLToPath, not `.pathname` — on Windows the latter yields "/C:/Users/..."
   with a leading slash, which is not a path any fs call will accept. */
const ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));
const FORCE = process.argv.includes('--force');

const exists = async (p) => !!(await stat(p).catch(() => null));

let written = 0;
let skipped = 0;

for (const collection of await readdir(ROOT)) {
  const from = join(ROOT, collection, 'zh-hant');
  const to = join(ROOT, collection, 'zh-hans');
  if (!(await exists(from))) continue;
  await mkdir(to, { recursive: true });

  for (const file of await readdir(from)) {
    if (!file.endsWith('.md')) continue;
    const target = join(to, file);
    if (!FORCE && (await exists(target))) {
      skipped += 1;
      continue;
    }
    const source = await readFile(join(from, file), 'utf8');
    await writeFile(target, convert(source), 'utf8');
    written += 1;
    console.log(`  ${collection}/zh-hans/${file}`);
  }
}

console.log(
  `\n${written} file(s) written, ${skipped} left alone.` +
    (skipped && !FORCE ? ' Run with --force to overwrite them.' : ''),
);
