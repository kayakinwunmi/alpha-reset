import { Resend } from "resend";
import { renderEmail, textToHtml } from "./email-template";
import { BESTDAY_URL, SITE_URL } from "./event";
import { getSupabase } from "./supabase";
import { T } from "./tables";

export type EmailType =
  | "welcome"
  | "returning"
  | "story"
  | "drip"
  | "approval"
  | "decline"
  | "broadcast";

/** Identifies the person/session an email is about, so we can log the send. */
export interface EmailLogContext {
  personId: string;
  type: EmailType;
  sessionId?: string | null;
}

let _resend: Resend | null = null;
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Kay from Alpha Reset <kay@alphareset.co>";

/**
 * Send any plain-text-authored email wrapped in the branded template.
 * Used by the drip sequences and admin broadcasts; the text version is
 * attached as a fallback for clients that prefer it.
 */
export async function sendBrandedEmail(opts: {
  to: string;
  subject: string;
  text: string;
  preheader?: string;
  cta?: { label: string; url: string };
  /** When set, a successful send is recorded in ar_email_log. */
  log?: EmailLogContext;
}) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: renderEmail({
      preheader: opts.preheader,
      contentHtml: textToHtml(opts.text),
      cta: opts.cta,
    }),
  });
  if (error) throw error;

  // Record the send. Best-effort: a logging failure (e.g. the ar_email_log
  // table not migrated yet) must never turn a delivered email into an error.
  if (opts.log) {
    try {
      await getSupabase().from(T.emailLog).insert({
        person_id: opts.log.personId,
        email: opts.to,
        type: opts.log.type,
        subject: opts.subject,
        session_id: opts.log.sessionId ?? null,
      });
    } catch (logErr) {
      console.error("Email-log insert failed:", logErr);
    }
  }
}

/** One line per session the person just registered for. */
export interface SessionLine {
  sessionId: string;
  title: string;
  rangeLabel: string;
  /** true when it's an in-person session awaiting Kay's approval */
  requested: boolean;
}

function sessionListText(lines: SessionLine[]): string {
  return lines
    .map(
      (l) =>
        `- ${l.title} · ${l.rangeLabel}${l.requested ? " (in person — place requested, we'll confirm by email)" : ""}`
    )
    .join("\n");
}

/** Per-session .ics links so people block the dates of THEIR sessions. */
function calendarLinksText(lines: SessionLine[]): string {
  if (lines.length === 1) {
    return `${SITE_URL}/api/calendar?session=${lines[0].sessionId}`;
  }
  return (
    "\n" +
    lines
      .map((l) => `   - ${l.title}: ${SITE_URL}/api/calendar?session=${l.sessionId}`)
      .join("\n")
  );
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  sessions: SessionLine[],
  personId: string
) {
  const hasRequest = sessions.some((s) => s.requested);
  const text = `Hey ${firstName},

Welcome to Alpha Reset. You're in.

Here's what you signed up for:

${sessionListText(sessions)}

Each reset is 72 hours. Here's what to expect:

- 72-hour water fast (water & coffee only)
- Daily walks or runs
- Deep prayer and meditation
- Written 90-day life review
- Set direction for the next quarter

Three things to do now:

1. Read the Field Guide — how to prepare, the day-by-day protocol, and how to break the fast: ${SITE_URL}/guide
2. Block the dates in your calendar: ${calendarLinksText(sessions)}
3. Join the group on Bestday to connect with other Alphas: ${BESTDAY_URL}
   (The reset itself is free — the group runs on Bestday Premium + AI, $249/year.)
${hasRequest ? "\nAbout the in-person reset: places are limited, so I confirm each one personally. You'll get an email from me either way.\n" : ""}
See you at the reset.

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: "Welcome to Alpha Reset 🦾",
    text,
    preheader: "You're in. Here's how to prepare.",
    cta: { label: "Read the Field Guide", url: `${SITE_URL}/guide` },
    log: { personId, type: "welcome" },
  });
}

/** Shorter confirmation for someone already on the list registering for more sessions. */
export async function sendReturningEmail(
  email: string,
  firstName: string,
  sessions: SessionLine[],
  personId: string
) {
  const hasRequest = sessions.some((s) => s.requested);
  const text = `Hey ${firstName},

Good to have you back. You're registered for:

${sessionListText(sessions)}
${hasRequest ? "\nAbout the in-person reset: places are limited, so I confirm each one personally. You'll get an email from me either way.\n" : ""}
Block the dates and I'll see you there: ${calendarLinksText(sessions)}

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: "You're registered 🦾",
    text,
    preheader: "Your next Alpha Reset is booked in.",
    log: { personId, type: "returning" },
  });
}

export async function sendApprovalEmail(
  email: string,
  firstName: string,
  session: { id?: string; title: string; rangeLabel: string; location: string | null },
  personId: string
) {
  const text = `Hey ${firstName},

Good news — your place is confirmed.

${session.title} · ${session.rangeLabel}${session.location ? `\nLocation: ${session.location}` : ""}

Details — travel, what to bring, and cost-sharing — are organised in the Bestday group, so make sure you're in: ${BESTDAY_URL}

This is the one people talk about all year. Come ready.

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: `Confirmed: ${session.title} 🦾`,
    text,
    preheader: "Your place at the in-person reset is confirmed.",
    cta: { label: "Join the group on Bestday", url: BESTDAY_URL },
    log: { personId, type: "approval", sessionId: session.id ?? null },
  });
}

export async function sendDeclineEmail(
  email: string,
  firstName: string,
  session: { id?: string; title: string; rangeLabel: string },
  personId: string
) {
  const text = `Hey ${firstName},

Thank you for requesting a place at ${session.title} (${session.rangeLabel}).

Places are very limited and I couldn't fit everyone in this time — I'm sorry to say I can't confirm yours for this one.

The quarterly resets are open to everyone, and I'd love to see you at the next in-person session. Stay close on Bestday: ${BESTDAY_URL}

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: `About your place at ${session.title}`,
    text,
    preheader: "An update on your in-person reset request.",
    log: { personId, type: "decline", sessionId: session.id ?? null },
  });
}
