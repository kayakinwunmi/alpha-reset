import { Resend } from "resend";
import { renderEmail, textToHtml } from "./email-template";
import {
  EVENT_START_LABEL,
  EVENT_START_ORDINAL,
  BESTDAY_URL,
  SITE_URL,
} from "./event";

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
 * Used by the drip sequence and admin broadcasts; the text version is
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

export async function sendWelcomeEmail(email: string, firstName: string) {
  const text = `Hey ${firstName},

Welcome to Alpha Reset. You're in.

The next session starts ${EVENT_START_LABEL} and runs for 72 hours. Here's what to expect:

- 72-hour water fast (water & coffee only)
- Daily walks or runs
- Deep prayer and meditation
- Written 90-day life review
- Set direction for the next quarter

Three things to do now:

1. Read the Field Guide — how to prepare, the day-by-day protocol, and how to break the fast: ${SITE_URL}/guide
2. Block the dates in your calendar: ${SITE_URL}/api/calendar
3. Join the group on Bestday to connect with other Alphas: ${BESTDAY_URL}

See you on ${EVENT_START_ORDINAL}.

Kay`;

  await sendBrandedEmail({
    to: email,
    subject: "Welcome to Alpha Reset 🦾",
    text,
    preheader: `The next reset starts ${EVENT_START_LABEL}. Here's how to prepare.`,
    cta: { label: "Read the Field Guide", url: `${SITE_URL}/guide` },
  });
}
