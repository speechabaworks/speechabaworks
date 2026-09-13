/**
 * speechabaworks.com — Cloudflare Worker
 *
 * Serves the built Astro site from ./dist as static assets (free and
 * unlimited on both Workers plans), and handles two API routes that
 * static hosting cannot:
 *
 *   POST /api/contact    → enquiry form  → email to Linda via Resend
 *   POST /api/subscribe  → guide signup  → email platform + guide delivery
 *
 * Secrets are set with `wrangler secret put NAME`, never committed:
 *   RESEND_API_KEY      required
 *   TURNSTILE_SECRET    optional — spam filtering
 *   EMAIL_API_KEY       optional — your email platform's API key
 *   EMAIL_LIST_ID       optional — the list/audience id to add people to
 */

interface Env {
  ASSETS: Fetcher;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET?: string;
  EMAIL_API_KEY?: string;
  EMAIL_LIST_ID?: string;
  NOTIFY_TO?: string;
  NOTIFY_FROM?: string;
}

const DEFAULT_TO = 'linda@speechabaworks.com';
const DEFAULT_FROM = 'Speech & ABA Works <no-reply@speechabaworks.com>';

const MESSAGES = {
  en: {
    contactOk: 'Thank you — your message is on its way. I reply to everything within two business days.',
    subscribeOk: 'Sent. Check your inbox in the next minute or two — including the promotions tab.',
    invalid: 'Please check the form and try again.',
    failed: 'That could not be sent. Please email linda@speechabaworks.com directly.',
  },
  zh: {
    contactOk: '謝謝你，訊息已送出。我會在兩個工作天內回覆。',
    subscribeOk: '已寄出。請在一兩分鐘內查看信箱，也記得看看促銷／垃圾郵件匣。',
    invalid: '請檢查表單內容後再試一次。',
    failed: '訊息傳送失敗，請直接來信 linda@speechabaworks.com。',
  },
} as const;

type Lang = keyof typeof MESSAGES;
const pickLang = (v: FormDataEntryValue | null): Lang => (v === 'zh' ? 'zh' : 'en');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Cloudflare Turnstile — skipped entirely if no secret is configured. */
async function passesTurnstile(env: Env, token: string | null, ip: string | null): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function sendEmail(env: Env, payload: Record<string, unknown>): Promise<boolean> {
  // These log lines are what make a failure diagnosable. The three causes
  // are indistinguishable from the visitor's side, so say which one it was
  // in the Worker log. The key itself is never logged — only whether it is
  // present and what Resend said back.
  if (!env.RESEND_API_KEY) {
    console.error('[mail] RESEND_API_KEY is not set on this Worker');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '<no body>');
    console.error(`[mail] Resend refused: HTTP ${res.status} — ${detail}`);
    console.error(`[mail] from was: ${String(payload.from)}  to was: ${JSON.stringify(payload.to)}`);
    return false;
  }

  console.log('[mail] sent');
  return true;
}

/* ───────────────────────────────────────── contact */

async function handleContact(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const lang = pickLang(form.get('lang'));
  const m = MESSAGES[lang];

  // Honeypot: bots fill this, people never see it.
  if (String(form.get('company') ?? '').trim() !== '') {
    return json({ ok: true, message: m.contactOk });
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const role = String(form.get('role') ?? 'unspecified');
  const preferred = String(form.get('preferredLanguage') ?? 'english');

  if (!name || !email || !message || !email.includes('@')) {
    return json({ ok: false, message: m.invalid }, 400);
  }

  const ok = await passesTurnstile(
    env,
    form.get('cf-turnstile-response') as string | null,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!ok) return json({ ok: false, message: m.invalid }, 400);

  const sent = await sendEmail(env, {
    from: env.NOTIFY_FROM ?? DEFAULT_FROM,
    to: [env.NOTIFY_TO ?? DEFAULT_TO],
    reply_to: email,
    subject: `Enquiry from ${name} (${role})`,
    html: `
      <h2>New enquiry</h2>
      <p><strong>Name:</strong> ${esc(name)}<br>
         <strong>Email:</strong> ${esc(email)}<br>
         <strong>Role:</strong> ${esc(role)}<br>
         <strong>Prefers:</strong> ${esc(preferred)}<br>
         <strong>Site language:</strong> ${lang}</p>
      <hr>
      <p style="white-space:pre-wrap">${esc(message)}</p>
    `,
  });

  return sent ? json({ ok: true, message: m.contactOk }) : json({ ok: false, message: m.failed }, 502);
}

/* ───────────────────────────────────────── subscribe */

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const lang = pickLang(form.get('lang'));
  const m = MESSAGES[lang];

  if (String(form.get('company') ?? '').trim() !== '') {
    return json({ ok: true, message: m.subscribeOk });
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const list = String(form.get('list') ?? 'general');

  if (!name || !email || !email.includes('@')) {
    return json({ ok: false, message: m.invalid }, 400);
  }

  const ok = await passesTurnstile(
    env,
    form.get('cf-turnstile-response') as string | null,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!ok) return json({ ok: false, message: m.invalid }, 400);

  // Tell Linda a new subscriber arrived. Delivery of the guide itself is
  // handled by the email platform's automation for this list.
  await sendEmail(env, {
    from: env.NOTIFY_FROM ?? DEFAULT_FROM,
    to: [env.NOTIFY_TO ?? DEFAULT_TO],
    subject: `New signup: ${list}`,
    html: `<p><strong>${esc(name)}</strong> &lt;${esc(email)}&gt; requested <strong>${esc(list)}</strong> (${lang}).</p>`,
  });

  // Add to the mailing list, if an email platform is wired up.
  // Replace this block with your platform's API call — see SETUP.md step 6.
  if (env.EMAIL_API_KEY && env.EMAIL_LIST_ID) {
    try {
      await fetch(`https://api.emailoctopus.com/lists/${env.EMAIL_LIST_ID}/contacts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          fields: { FirstName: name },
          tags: [list, `lang:${lang}`],
          status: 'subscribed',
        }),
      });
    } catch {
      // A list failure must not lose the lead — Linda already has the email above.
    }
  }

  return json({ ok: true, message: m.subscribeOk });
}

/* ───────────────────────────────────────── entry */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false }, 405);
      return handleContact(request, env);
    }

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') return json({ ok: false }, 405);
      return handleSubscribe(request, env);
    }

    // Everything else is the static site.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
