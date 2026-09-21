import { deepHans } from '../lib/zh';

/* ─────────────────────────────────────────────────────────────
   Three locales, two languages.

   English and Traditional Chinese are written by hand. Simplified
   Chinese is derived from the Traditional at build time (see lib/zh.ts),
   so there is only ever one Chinese text to keep up to date.
   ───────────────────────────────────────────────────────────── */

export const languages = {
  en: 'English',
  'zh-hant': '繁體中文',
  'zh-hans': '简体中文',
} as const;

export const defaultLang = 'en' as const;
export type Lang = keyof typeof languages;
export const allLangs: Lang[] = ['en', 'zh-hant', 'zh-hans'];

/** Short label used in the header switcher. */
export const langShort: Record<Lang, string> = {
  en: 'EN',
  'zh-hant': '繁',
  'zh-hans': '简',
};

/** BCP-47 tag for <html lang>, hreflang and Intl. */
export const htmlLang: Record<Lang, string> = {
  en: 'en',
  'zh-hant': 'zh-Hant',
  'zh-hans': 'zh-Hans',
};

export const isZh = (lang: Lang): boolean => lang !== 'en';

/** Source copy is written in `en` and `zh` (Traditional). */
export type Bilingual<T> = { en: T; zh: T };

/** Pick the right variant, converting to Simplified when needed. */
export function copyFor<T>(copy: Bilingual<T>, lang: Lang): T {
  if (lang === 'en') return copy.en;
  if (lang === 'zh-hant') return copy.zh;
  return deepHans(copy.zh);
}

/* ───────────────────────────────────────── site constants */

export const site = {
  name: 'Speech & ABA Works',
  nameZh: '助言起行',
  descriptorZh: '言語行為協作治療室',
  domain: 'speechabaworks.com',
  email: 'linda@speechabaworks.com',
  /* Optional. Leave blank and the contact page invites people to send the
     inquiry form, which is where every "book a call" button on the site
     leads. If you later set up Cal.com or similar, paste the link here and
     an "Open the calendar" button appears on the contact page as well. */
  booking: '',
  /* Paste your real profile URLs here. A blank string hides that link
     everywhere it appears — footer, contact page, and the search-engine
     profile data — so an empty entry is safe, a wrong one is not. */
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  } as Record<'instagram' | 'facebook' | 'linkedin', string>,
  stats: [
    { value: '20+', key: 'stat.years' },
    { value: '1,000+', key: 'stat.children' },
    { value: '25+', key: 'stat.sites' },
    { value: '500+', key: 'stat.coached' },
  ],
} as const;

/* ───────────────────────────────────────── routes */

const PREFIX: Record<Lang, string> = { en: '', 'zh-hant': '/zh-hant', 'zh-hans': '/zh-hans' };

const SEGMENTS = {
  home: '',
  about: '/meet-linda',
  services: '/services',
  collaborate: '/collaborate',
  resources: '/resources',
  blog: '/blog',
  faqs: '/faqs',
  testimonials: '/testimonials',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
} as const;

export type RouteKey = keyof typeof SEGMENTS;

export function path(key: RouteKey, lang: Lang): string {
  const p = PREFIX[lang] + SEGMENTS[key];
  return p === '' ? '/' : p;
}

/** The same page in another language, given the current route key. */
export function altPaths(key: RouteKey, lang: Lang): { lang: Lang; href: string }[] {
  return allLangs.filter((l) => l !== lang).map((l) => ({ lang: l, href: path(key, l) }));
}

export const navOrder: RouteKey[] = ['about', 'services', 'collaborate', 'resources', 'blog', 'faqs'];

/** Derive the language from a URL pathname. */
export function langFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  if (first === 'zh-hant') return 'zh-hant';
  if (first === 'zh-hans') return 'zh-hans';
  return 'en';
}

/* ───────────────────────────────────────── UI strings */

const strings = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'Meet Linda',
    'nav.services': 'Services',
    'nav.collaborate': 'Partners & Talks',
    'nav.resources': 'Resources',
    'nav.blog': 'Writing',
    'nav.faqs': 'FAQs',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.skip': 'Skip to content',
    'nav.langLabel': 'Language',

    'cta.book': 'Book a discovery call',
    'cta.bookShort': 'Book a call',
    'cta.collab': "Let's collaborate",
    'cta.connect': "Let's Connect",
    'cta.services': 'See services & rates',
    'cta.download': 'Get the guide',
    'cta.downloadDirect': 'Download the PDF',
    'cta.allPosts': 'All writing',

    'stat.years': 'Years of clinical experience',
    'stat.children': 'Children served',
    'stat.sites': 'Schools & clinics partnered',
    'stat.coached': 'Educators & clinicians coached',

    'footer.tagline': 'Bilingual SLP–ABA consultation for neurodivergent children, birth to ten.',
    'footer.explore': 'Explore',
    'footer.connect': 'Connect',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms & conditions',
    'footer.disclaimer': 'Service disclaimer',
    'footer.rights': 'All rights reserved.',
    'footer.builtNote': 'Consultation and coaching services. Not a substitute for direct clinical assessment or treatment.',

    'blog.readingTime': 'min read',
    'blog.updated': 'Updated',
    'blog.back': 'Back to all writing',
    'blog.empty': 'The first pieces are being written. Join the list to be told when they land.',
    'blog.tags': 'Topics',

    'form.name': 'Your name',
    'form.email': 'Email address',
    'form.role': 'You are a…',
    'form.role.parent': 'Parent or family member',
    'form.role.slp': 'Speech-language pathologist',
    'form.role.bcba': 'BCBA or behavior analyst',
    'form.role.educator': 'Educator or administrator',
    'form.role.other': 'Something else',
    'form.language': 'Preferred language for the conversation',
    'form.message': 'What would you like to work on?',
    'form.send': 'Send inquiry',

    'signup.heading': 'Get the guide',
    'signup.button': 'Send it to me',
    'signup.consent': 'You will receive the guide and occasional writing on SLP–ABA collaboration. Unsubscribe any time.',

    'testimonials.heading': 'What colleagues and families say',
    'nav.testimonials': 'Testimonials',
    'testimonials.readAll': 'Read all {n} testimonials',
    'testimonials.full': 'Read the full testimony',
    'testimonials.fromZh': 'Translated from Chinese',
    'testimonials.fromEn': 'Translated from English',
    'testimonials.showOriginal': 'Show the original',
    'services.rate': 'Rate',
    'services.who': 'Who it is for',
    'services.format': 'Format',
    'services.duration': 'Duration',
  },

  zh: {
    'nav.home': '首頁',
    'nav.about': '認識 Linda',
    'nav.services': '服務與收費',
    'nav.collaborate': '合作夥伴與演講',
    'nav.resources': '免費資源',
    'nav.blog': '專欄文章',
    'nav.faqs': '常見問題',
    'nav.contact': '聯絡',
    'nav.menu': '選單',
    'nav.skip': '跳至主要內容',
    'nav.langLabel': '語言',

    'cta.book': '預約諮詢通話',
    'cta.bookShort': '預約通話',
    'cta.collab': '洽談合作',
    'cta.connect': '聯繫我',
    'cta.services': '查看服務與收費',
    'cta.download': '索取指南',
    'cta.downloadDirect': '下載 PDF',
    'cta.allPosts': '所有文章',

    'stat.years': '年臨床經驗',
    'stat.children': '位孩子受惠',
    'stat.sites': '所學校與機構合作',
    'stat.coached': '位教育與臨床專業人員受訓',

    'footer.tagline': '為 0 至 10 歲神經多樣性兒童提供中英雙語的語言治療與應用行為分析整合諮詢。',
    'footer.explore': '網站導覽',
    'footer.connect': '聯絡方式',
    'footer.legal': '法律聲明',
    'footer.privacy': '隱私權政策',
    'footer.terms': '服務條款',
    'footer.disclaimer': '服務免責聲明',
    'footer.rights': '版權所有。',
    'footer.builtNote': '本網站提供諮詢與指導服務，不能取代直接的臨床評估或治療。',

    'blog.readingTime': '分鐘閱讀',
    'blog.updated': '更新於',
    'blog.back': '返回所有文章',
    'blog.empty': '文章正在撰寫中。歡迎訂閱電子報，新文章上線時第一時間通知你。',
    'blog.tags': '主題',

    'form.name': '你的姓名',
    'form.email': '電子郵件',
    'form.role': '你的身分是',
    'form.role.parent': '家長或家庭成員',
    'form.role.slp': '語言治療師',
    'form.role.bcba': 'BCBA 或行為分析師',
    'form.role.educator': '教師或行政人員',
    'form.role.other': '其他',
    'form.language': '希望以哪種語言溝通',
    'form.message': '你希望討論什麼？',
    'form.send': '送出訊息',

    'signup.heading': '索取免費指南',
    'signup.button': '寄給我',
    'signup.consent': '你將收到這份指南，以及不定期的 SLP–ABA 協作專欄。隨時可以取消訂閱。',

    'testimonials.heading': '同業與家長的回饋',
    'nav.testimonials': '真實回饋',
    'testimonials.readAll': '閱讀全部 {n} 則回饋',
    'testimonials.full': '閱讀完整內容',
    'testimonials.fromZh': '譯自中文',
    'testimonials.fromEn': '譯自英文',
    'testimonials.showOriginal': '查看原文',
    'services.rate': '收費',
    'services.who': '適合對象',
    'services.format': '形式',
    'services.duration': '時長',
  },
} as const;

export type UiKey = keyof (typeof strings)['en'];

const hansStrings = deepHans(strings.zh) as Record<string, string>;

export function useTranslations(lang: Lang) {
  const table: Record<string, string> =
    lang === 'en' ? strings.en : lang === 'zh-hant' ? strings.zh : hansStrings;
  return function t(key: UiKey): string {
    return table[key] ?? (strings.en as Record<string, string>)[key] ?? String(key);
  };
}
