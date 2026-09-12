import { getCollection, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n/ui';

const INTL_LOCALE: Record<Lang, string> = {
  en: 'en-US',
  'zh-hant': 'zh-Hant-TW',
  'zh-hans': 'zh-Hans-CN',
};

/** Entries live at `<lang>/<slug>`. Return only the ones for `lang`,
 *  and expose the bare slug so routes stay clean. */
export async function byLang<C extends CollectionKey>(collection: C, lang: Lang) {
  const all = await getCollection(collection);
  return all
    .filter((e) => e.id.startsWith(`${lang}/`))
    .map((e) => ({ ...e, slug: e.id.slice(lang.length + 1) }));
}

export function sortByOrder<T extends { data: { order?: number } }>(items: T[]) {
  return [...items].sort((a, b) => (a.data.order ?? 50) - (b.data.order ?? 50));
}

export function sortByDateDesc<T extends { data: { pubDate?: Date; date?: Date } }>(items: T[]) {
  const at = (i: T) => (i.data.pubDate ?? i.data.date ?? new Date(0)).valueOf();
  return [...items].sort((a, b) => at(b) - at(a));
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonth(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/** Rough reading time, counting CJK characters individually. */
export function readingTime(body: string, lang: Lang): number {
  if (lang !== 'en') {
    const chars = (body.match(/[一-鿿]/g) ?? []).length;
    return Math.max(1, Math.round(chars / 400));
  }
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
