# Alpha Reset

The site for [alphareset.co](https://www.alphareset.co) — a quarterly 72-hour water-fasting + life-review challenge. Next.js (App Router) + Supabase + Resend, deployed on Vercel.

## What's here

| Route | What it is |
|---|---|
| `/` | Landing page — the invitation, protocol, upcoming schedule ("The Calendar"), FAQ, signup |
| `/guide` | The Field Guide — prep, day-by-day protocol, breaking the fast |
| `/admin` | **The Ledger** — private dashboard: sessions, approvals, people, broadcasts |
| `/api/signup` | Registers a person for one or more sessions (honeypot + time-trap protected) |
| `/api/drip` | Daily cron — story emails per person + countdown emails per registration |
| `/api/calendar` | Downloadable `.ics` — `?session=<id>` for a specific session |
| `/api/admin/*` | Login/logout, sessions CRUD, approve/decline requests, delete, broadcasts |

## Sessions: how scheduling works

Sessions live in the database and are managed entirely from **The Ledger**. Create the next 2–5 resets ahead of time; they appear on the site's Calendar section and in the signup form immediately (session changes purge the page cache on save; a 5-minute background revalidation is the fallback).

- **Virtual sessions** — signup confirms instantly.
- **In-person retreats** (`kind = in_person`) — signup becomes a *request*. Requests show up at the top of the dashboard for you to approve or decline; both actions email the person. Capacity and location are shown on the site; money/contributions are handled off-platform (put "shared costs — details in the group" in the session's public note).

One person = one `signups` row (keyed by email). Each session they join = one `registrations` row carrying their intention, status, and drip progress. Returning members can register for future sessions without a "you're already signed up" error.

If the database is unreachable or migrations haven't run, the site falls back to a hardcoded session (`lib/event.ts` → `FALLBACK_SESSION`) rather than breaking.

## Emails

Everything is plain-text-authored and wrapped in the branded template (`lib/email-template.ts`) at send time. Two sequences (`lib/drip-emails.ts`), driven by the daily cron in `vercel.json`:

- **Story emails** — "Why I started", sent once per person ever, 2 days after their first signup (`signups.story_stage`).
- **Session countdown** — prep (7 days out), 48h reminder, Day 1–3, and the congrats email, per confirmed registration, timed against that session's dates (`registrations.drip_stage`).

Welcome emails adapt: first-timers get the full welcome; returning members get a short "you're registered" note; in-person requests explain the approval step.

## Admin dashboard

Visit `/admin`, log in with `ADMIN_PASSWORD`. You can:

- Create/edit/cancel sessions (dates, virtual vs in-person, location, places, public note, draft/open status)
- Approve or decline in-person requests (emails sent automatically)
- See growth, drip progress for the next session, and pending-request counts
- Filter people by session, read intentions, export CSV, remove people
- Broadcast to everyone, a hand-picked selection, or all confirmed people of one session (`{{name}}` personalises, live preview)

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

All tables are prefixed **`ar_`** (`ar_signups`, `ar_sessions`, `ar_registrations`, `ar_messages`) so the Supabase project can be shared with other apps. Table names are centralised in `lib/tables.ts` — if they ever change again, that's the only code file to touch.

Run in the Supabase SQL Editor (all idempotent):

**Existing database (was set up before the `ar_` prefix):**
1. `supabase-migration-3.sql` — renames your existing tables to the `ar_` names, preserving all data, constraints, and policies. Run this *before* deploying the prefixed code.
2. `supabase-migration-2.sql` — if you haven't run it yet (sessions + registrations + backfill).

**Fresh database:**
1. `supabase-schema.sql` — base `ar_signups` table
2. `supabase-migration.sql` — intention, drip columns, optional phone, `ar_messages` log
3. `supabase-migration-2.sql` — `ar_sessions` + `ar_registrations`, `story_stage`, and a backfill that creates the June 2026 session and registers every existing signup for it (preserving their drip progress)

## Post-deploy checklist

1. Run `supabase-migration-3.sql` (then `supabase-migration-2.sql` if not yet run); open The Ledger and confirm the June session appears with your existing people registered.
2. Create the next few sessions (+ the in-person retreat with location/places/note).
3. Sign up a test email for two sessions; check the welcome email lists both and the in-person one shows as "requested".
4. Approve the test request from the dashboard; check the confirmation email.
5. Trigger the drip once and read the results JSON: `curl -H "Authorization: Bearer $CRON_SECRET" https://www.alphareset.co/api/drip`

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```
