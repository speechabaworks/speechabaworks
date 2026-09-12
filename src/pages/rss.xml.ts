import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://speechabaworks.com';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const items = posts
    .map((p) => {
      const lang = p.id.startsWith('zh/') ? 'zh' : 'en';
      const slug = p.id.slice(3);
      const url = lang === 'zh' ? `${SITE}/zh/blog/${slug}` : `${SITE}/blog/${slug}`;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <dc:language>${lang === 'zh' ? 'zh-Hant' : 'en'}</dc:language>
${p.data.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Speech &amp; ABA Works</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Writing on SLP–ABA collaboration, AAC, and supporting neurodivergent children — in English and Chinese.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
