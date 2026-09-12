# Getting speechabaworks.com live

Everything below is free except the domain you already own. Work through it in
order — each step leaves you somewhere safe to stop.

**Do not cancel GoHighLevel until step 9.** Your subscriber list, both PDF
guides, your appointment history and every contact record live inside that
account, and they do not survive cancellation.

---

## Step 0 · Empty the GoHighLevel account (do this first, today)

This is independent of everything else and is the only step with a deadline.

- [ ] Export **contacts** to CSV — names, emails, tags, and the source of each
- [ ] Download **both PDF guides** in every language *(already done — they are in `public/files/`)*
- [ ] Export **form and survey submissions** you have not actioned
- [ ] Export **appointment history**, and note any calls already booked in the future
- [ ] Export **payment and invoice records** for your accountant
- [ ] Screenshot each **email automation** before rebuilding it elsewhere
- [ ] Download every **image** hosted there at full resolution
- [ ] Check whether a **phone number** is provisioned, and whether anyone uses it —
      it dies with the account and cannot be ported to a free service
- [ ] Note the **notice period** on the agency agreement, in writing

---

## Step 1 · Put the site in a GitHub repository

You need a free GitHub account. The repository can be private.

```bash
cd speechabaworks
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/speechabaworks.git
git push -u origin main
```

---

## Step 2 · Deploy to Cloudflare Workers

Your domain is already registered with Cloudflare and in your name, so there is
nothing to transfer.

1. Cloudflare dashboard → **Compute (Workers)** → **Create** → **Import a repository**
2. Choose the repository from step 1
3. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Output directory: `dist`
4. Deploy, and check the `*.workers.dev` URL it gives you

Every `git push` to `main` now rebuilds and redeploys automatically.
**Do not point the domain at it yet** — that is step 8.

Static-asset requests are free and unlimited. The free plan's 100,000
requests/day limit applies only to the two small API routes (contact form and
CMS login), which is far beyond what this site will generate.

---

## Step 3 · Turn on the contact form

The form and the signup form both post to a Worker route that emails you.

1. Create a free account at **resend.com** and verify `speechabaworks.com`
   (it gives you three DNS records to add — since your DNS is already at
   Cloudflare, this takes about two minutes)
2. Create an API key
3. Add it as a secret:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put NOTIFY_TO        # the inbox you actually read
```

Resend's free tier is 3,000 emails a month — far more than you will need.

**Optional spam filter.** Cloudflare Turnstile is free: create a widget in the
dashboard, then `npx wrangler secret put TURNSTILE_SECRET`. The Worker skips
the check entirely when no secret is set, so the form works either way.

---

## Step 4 · Turn on the CMS

This gives you `speechabaworks.com/admin` — write posts, change rates, add
testimonials, all three languages side by side, no code.

1. **GitHub OAuth app**: GitHub → Settings → Developer settings → OAuth Apps →
   New. Callback URL: `https://auth.speechabaworks.com/callback`.
   Note the Client ID and Client Secret.
2. **Auth Worker**: deploy the open-source
   [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Worker to
   your Cloudflare account (its README has a one-click button). Set
   `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as secrets, and give it the
   route `auth.speechabaworks.com`.
3. **Point the CMS at both**: edit `public/admin/config.yml` and fill in

   ```yaml
   backend:
     repo: YOUR-USERNAME/speechabaworks     # ← your repo
     base_url: https://auth.speechabaworks.com   # ← your auth Worker
   ```

4. Push, then visit `/admin` and log in with GitHub.

Saving in the CMS commits to the repository, which triggers a rebuild. Changes
are live in roughly a minute.

---

## Step 5 · Booking calendar

1. Create a free account at **cal.com**
2. Make a 20-minute event type called *Discovery call*
3. Connect your Google Calendar and set your availability
4. Copy the booking link, then paste it into `src/i18n/ui.ts`:

   ```ts
   booking: 'https://cal.com/your-name/discovery',
   ```

Cal.com handles time-zone conversion for the visitor, which matters given you
book across New York, Taipei, Hong Kong, London and Sydney.

---

## Step 6 · Email list and guide delivery

Both free guides are gated behind a signup form. Pick a free email platform —
**EmailOctopus** and **Brevo** both have real free tiers at your list size.

1. Create the account and import the contacts you exported in step 0
2. Create two lists (or tags) matching the `formId` in each resource:
   `collaboration-checklist` and `from-play-to-purpose`
3. Set up an automation on each list that sends the guide immediately
4. Add the API credentials:

```bash
npx wrangler secret put EMAIL_API_KEY
npx wrangler secret put EMAIL_LIST_ID
```

The Worker emails you about every signup regardless, so a list-API failure
never loses a lead. If you would rather not gate the guides at all, set
`gated: false` on a resource in the CMS and the PDF downloads directly.

---

## Step 7 · Payments

Connect **Stripe** directly rather than through a platform. Create payment
links for the $150 consultation and any package rates, then send them with your
booking confirmations. No monthly fee — just the per-transaction cut you are
already paying today, since GoHighLevel charges you *on top of* Stripe rather
than instead of it.

---

## Step 8 · Point the domain at the new site

1. Cloudflare → Workers → your Worker → **Settings → Domains & Routes**
2. Add `speechabaworks.com` and `www.speechabaworks.com`
3. Check every page, in all three languages, and test the contact form
4. Submit `https://speechabaworks.com/sitemap-index.xml` in Google Search Console

The redirects in `public/_redirects` already map every old GoHighLevel URL
(`/meetlinda`, `/partnersandtalks`, `/about-chinese`, and the rest) to its new
home, so nothing you have linked from a podcast or a conference slide breaks.

---

## Step 9 · Cancel GoHighLevel

Leave it running and paid for **one more billing cycle** after the switch, as
insurance. Then cancel in writing, and confirm the cancellation in writing too.

---

# Running the site day to day

### Writing a post

Go to `/admin`, choose **Writing**, click **New**. Write the English and
Traditional Chinese versions side by side, hit publish. Live in about a minute.

### The three languages

- **English** and **Traditional Chinese** are written by hand.
- **Simplified Chinese** is generated from the Traditional.

After adding Traditional content, run:

```bash
npm run sync:hans
```

This fills in the Simplified version using a phrase-level conversion, so
vocabulary differences are handled and not just characters (資訊 → 信息,
軟體 → 软件). It **never overwrites** a Simplified file that already exists, so
anything you correct by hand for a mainland audience survives future syncs.
Use `npm run sync:hans -- --force` only if you deliberately want to rebuild
everything from the Traditional.

> **Worth a review pass:** automatic conversion is good but not perfect on
> clinical terminology. Read through the Simplified pages once and fix anything
> that reads oddly to a mainland clinician — those corrections are then permanent.

### Changing rates

`/admin` → **Services & rates**. Each service is one entry. Changing `$150 USD
/ hour` there updates the services page and the home page together.

### Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

---

# What is where

```
src/
  content/          all editable content, one folder per language
    posts/  services/  testimonials/  talks/  partners/  resources/  faqs/
      en/  zh-hant/  zh-hans/
  components/
    pages/          one component per page, holding the English and
                    Traditional Chinese copy side by side
  i18n/ui.ts        site constants, routes, and all interface text
  lib/zh.ts         Traditional → Simplified conversion (build time only)
  styles/global.css the design system — colours, type, spacing
public/
  admin/            the CMS
  files/            the four PDF guides
  images/           logo, portrait, credential badges
  _redirects        old GoHighLevel URLs → new ones
worker/index.ts     contact form and signup handling
scripts/            the Simplified Chinese sync
```

---

# Still to do

Things I could not finish without you:

- **Replace the seed blog post.** `aac-autonomy-and-prompt-fading` is a draft I
  wrote from material already on your site, to show what the blog looks like
  with something in it. Edit it into your own voice or delete it.
- **Check the Simplified Chinese** clinical terminology, as above.
- **Confirm the two Chinese testimonial names.** I kept Hui-Min Xie romanised
  rather than guess at the characters.
- **Social links** in `src/i18n/ui.ts` are guesses at your handles — correct them.
- **Photography.** Only the portrait and logo are in place. The talk and
  workshop images from your Drive folder can go on the Partners & Talks page
  whenever you want them there.
