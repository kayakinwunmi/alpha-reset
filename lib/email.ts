import { Resend } from "resend";
import { renderEmail, textToHtml } from "./email-template";
import { BESTDAY_URL, SITE_URL } from "./event";

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
}

/** One line per session the person just registered for. */
export interface SessionLine {
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

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  sessions: SessionLine[]
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
2. Block the dates in your calendar: ${SITE_URL}/api/calendar
3. Join the group on Bestday to connect with other Alphas: ${BESTDAY_URL}
${hasRequest ? "\nAbout the in-person reset: places are limited, so I confirm each one personally. You'll get an email from me either way.\n" : ""}
See you at the reset.

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: "Welcome to Alpha Reset 🦾",
    text,
    preheader: "You're in. Here's how to prepare.",
    cta: { label: "Read the Field Guide", url: `${SITE_URL}/guide` },
  });
}

/** Shorter confirmation for someone already on the list registering for more sessions. */
export async function sendReturningEmail(
  email: string,
  firstName: string,
  sessions: SessionLine[]
) {
  const hasRequest = sessions.some((s) => s.requested);
  const text = `Hey ${firstName},

Good to have you back. You're registered for:

${sessionListText(sessions)}
${hasRequest ? "\nAbout the in-person reset: places are limited, so I confirm each one personally. You'll get an email from me either way.\n" : ""}
Block the dates (${SITE_URL}/api/calendar) and I'll see you there.

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: "You're registered 🦾",
    text,
    preheader: "Your next Alpha Reset is booked in.",
  });
}

export async function sendApprovalEmail(
  email: string,
  firstName: string,
  session: { title: string; rangeLabel: string; location: string | null }
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
  });
}

export async function sendDeclineEmail(
  email: string,
  firstName: string,
  session: { title: string; rangeLabel: string }
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
  });
}
