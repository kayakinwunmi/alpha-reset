# Alpha Reset

The site for [alphareset.co](https://www.alphareset.co) — a quarterly 72-hour water-fasting + life-review challenge. Next.js (App Router) + Supabase + Resend, deployed on Vercel.

## What's here

| Route | What it is |
|---|---|
| `/` | Landing page — the invitation, protocol, FAQ, signup |
| `/guide` | The Field Guide — prep, day-by-day protocol, breaking the fast |
| `/admin` | **The Ledger** — private dashboard: stats, signups, broadcasts |
| `/api/signup` | Signup endpoint (honeypot + time-trap spam protection, sends welcome email) |
| `/api/drip` | Daily cron — advances each signup through the email drip sequence |
| `/api/calendar` | Downloadable `.ics` for the event dates |
| `/api/admin/*` | Login/logout, delete signup, send broadcast |

## The one file that matters each quarter

All event dates live in **`lib/event.ts`**. When the next reset is announced, update that file (dates, labels, next-reset hint) — the site, meta tags, FAQ, drip triggers, welcome email, and calendar file all read from it.

## Emails

Everything is written in plain text and wrapped in the branded template (`lib/email-template.ts`) at send time, so the welcome email, the 7-stage drip (`lib/drip-emails.ts`), and admin broadcasts all look like one product. The drip is driven by a Vercel cron (`vercel.json`) hitting `/api/drip` daily at 08:00 UTC.

## Admin dashboard

Visit `/admin` and log in with `ADMIN_PASSWORD`. From there you can:

- See signups, growth over 30 days, and drip-sequence progress
- Search signups and read each person's stated intention
- Send a broadcast email to everyone or a selected subset (`{{name}}` personalises, with live preview)
- Export signups to CSV, remove individual signups

Sessions are an httpOnly HMAC cookie derived from the password — changing `ADMIN_PASSWORD` logs everyone out.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | From address, e.g. `Kay from Alpha Reset <kay@alphareset.co>` |
| `CRON_SECRET` | Bearer token protecting `/api/drip` |
| `ADMIN_PASSWORD` | Password for `/admin` (dashboard is disabled without it) |

## Database

Fresh setup: run `supabase-schema.sql`, then `supabase-migration.sql` in the Supabase SQL Editor.

Existing database: just run `supabase-migration.sql` — it adds the `intention` column, drip-tracking columns, makes `phone` optional, and creates the `messages` broadcast log. It's idempotent, and the app degrades gracefully if you haven't run it yet (signups still save; broadcasts just aren't logged).

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```
