# CLAUDE.md

Site for [alphareset.co](https://www.alphareset.co) — a quarterly 72-hour water-fasting +
life-review challenge run by Kay. Next.js 15 (App Router, TypeScript, Tailwind v4) +
Supabase (Postgres) + Resend (email), deployed on Vercel. Public landing page + Field
Guide, session signups with an automated email journey, and a password-protected admin
dashboard ("The Ledger") at `/admin`.

## Commands

```bash
pnpm dev          # local dev server
pnpm lint         # eslint — must pass before committing
pnpm build        # production build — must pass before committing
pnpm start -p N   # serve the production build for smoke tests
```

There is **no test suite**. Verification = `pnpm lint && pnpm build`, then curl smoke
tests against a running build: `/`, `/guide`, `/api/calendar` must return 200 and
`/admin` must 307-redirect to `/admin/login`.

**The site runs with zero env vars.** With no database credentials, pages render a
hardcoded fallback session instead of erroring. This is deliberate (deploy-before-migrate
safety) and doubles as the local smoke test — if a page blanks without creds, you broke
the fallback contract.

## Architecture

| Path | Role |
| --- | --- |
| `lib/tables.ts` | `T` — the ONLY place database table names live |
| `lib/event.ts` | True statics (`BESTDAY_URL`, `SITE_URL`, `GROUP_CALL_TIME`) + `FALLBACK_SESSION` |
| `lib/session-types.ts` | **Client-safe**: session/registration types + pure date-label helpers (en-GB, UTC) |
| `lib/sessions.ts` | **Server-only** session fetchers; every one falls back to `FALLBACK_SESSION` |
| `lib/supabase.ts` | Service-role client (server-only) |
| `lib/admin-auth.ts` | HMAC cookie auth derived from `ADMIN_PASSWORD` (30-day sessions) |
| `lib/email.ts` | Resend + `sendBrandedEmail` + welcome/returning/approval/decline emails |
| `lib/email-template.ts` | Branded HTML wrapper; `textToHtml` converts plain text |
| `lib/drip-emails.ts` | `STORY_DRIPS` (once per person) + `SESSION_DRIPS` (per registration) |
| `app/page.tsx`, `app/guide/page.tsx` | Async server components, ISR `revalidate = 300` |
| `app/api/signup` | Person upsert + per-session registrations (+ legacy fallback path) |
| `app/api/drip` | Daily cron (8:00 UTC, `vercel.json`), bearer-guarded by `CRON_SECRET` |
| `app/api/admin/*` | Sessions CRUD, approve/decline, broadcasts, delete — all cookie-guarded |
| `app/admin/*` | The Ledger dashboard (client components) |
| `supabase-*.sql` | Numbered idempotent migrations, run manually in the Supabase SQL editor |

## Hard invariants — do not break these

1. **Table names only via `T`** (`lib/tables.ts`). All tables are prefixed `ar_` because
   the Supabase project is **shared with the Bestday app**. This includes PostgREST embed
   strings — write `` `person:${T.signups}(...)` ``, never a literal table name. Never
   read or write non-`ar_` tables.
2. **Server/client boundary**: `lib/sessions.ts` and `lib/supabase.ts` use the
   service-role key — never import them into a `"use client"` file. Client components get
   session data as serializable props (`PublicSession` via `toPublicSession`) and shared
   helpers from `lib/session-types.ts`.
3. **The public site never blanks.** Session fetchers catch everything and return
   `FALLBACK_SESSION`; the signup API degrades to `legacySignup()` when the sessions
   table is missing. Preserve this contract when touching any fetcher or the signup flow.
4. **Cache purging**: `/` and `/guide` are ISR (5 min). Any mutation that changes what
   those pages render must call `refreshPublicPages()`
   (`app/api/admin/sessions/route.ts`) — i.e. `revalidatePath("/")` + `"/guide"`.
5. **Every `/api/admin/*` route** starts with
   `isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)` → 401.
6. **Emails are plain-text authored** and always sent through `sendBrandedEmail` (never
   raw Resend calls). Two independent drip state machines:
   `ar_signups.story_stage` (story email, once per person ever) and
   `ar_registrations.drip_stage` (0→6 countdown per session, 20-hour resend guard on
   `last_drip_at`). Broadcasts support `{{name}}` substitution.
7. **Session conventions**: fasts start **midnight UTC** on the start date and end
   **18:00 UTC** on the end date (the admin form encodes this — date-only inputs).
   Copy conventions built on that: the **kick-off call and last meal are the evening
   BEFORE the start date** (`sessionKickoffWeekday`), "72 hours" counts from that last
   meal, and the `.ics` is an **all-day event** (timed UTC entries render as 1am–7pm
   for UK users). Status ∈ `draft | open | completed | cancelled`; only `open` + future
   `ends_at` appears publicly. `kind = in_person` ⇒ signup creates a `requested`
   registration that Kay approves/declines from the dashboard (emails fire on
   decision); `capacity` is display-only — the approval queue is the real headcount
   control.
8. **Migrations are append-only.** Never rewrite an applied `supabase-*.sql`; add the
   next number. Keep them idempotent (`IF NOT EXISTS`, conditional `DO $$` blocks). They
   are run manually (SQL editor or Supabase MCP), not by CI.
9. **Signup anti-spam**: honeypot field + `_t` time trap return **silent success** — keep
   it that way so bots learn nothing.
10. **Money stays off-platform.** The site takes no payments and never states retreat
    prices; cost-sharing happens in the Bestday group. The one amount that IS shown
    (site + welcome email) is the Bestday Premium + AI membership ($249/year) — keep
    that disclosure consistent. Don't add payment features without an explicit ask.

## Environment variables

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Database (server-only key) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email sending |
| `CRON_SECRET` | Bearer token for `/api/drip` |
| `ADMIN_PASSWORD` | The Ledger login (changing it logs everyone out) |

## Workflow

- Develop on a feature branch; `pnpm lint && pnpm build` must be clean before committing.
- Run the no-creds smoke test (see Commands) for anything touching public pages or
  fetchers.
- Schema changes = new numbered migration file + matching code + README note; apply to
  the shared Supabase project deliberately (renames/DDL affect production immediately).
- Merging to `main` deploys via Vercel. If a change renames tables/columns, apply the
  migration **before** deploying the code that reads the new names.

## Style

- Match the "personal letter" aesthetic: Tailwind CSS variables (`--ink`, `--ink-light`,
  `--ink-faint`, `--accent`, `--paper`, `--paper-dark`, `--rule`), serif body, uppercase
  tracked sans labels.
- Dates are en-GB, formatted only via the helpers in `lib/session-types.ts` (UTC-based;
  e.g. "24–26 June 2026").
- Email/website copy is Kay's voice: short sentences, direct, warm, no fluff.
