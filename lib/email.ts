import { Resend } from "resend";
import { renderEmail, textToHtml } from "./email-template";
import { BESTDAY_URL, SITE_URL } from "./event";
import { getSupabase } from "./supabase";
import { T } from "./tables";
import { EMAIL_TEMPLATES_BY_SLUG, renderTemplate } from "./email-templates";

/** Admin overrides for email templates, keyed by slug. */
export type TemplateOverrides = Map<string, { subject: string; body: string }>;

/** Load all template overrides once (best-effort — empty if not migrated). */
export async function loadTemplateOverrides(): Promise<TemplateOverrides> {
  const map: TemplateOverrides = new Map();
  try {
    const { data } = await getSupabase().from(T.emailTemplates).select("slug, subject, body");
    for (const r of data || []) map.set(r.slug, { subject: r.subject, body: r.body });
  } catch (err) {
    console.error("Template overrides load failed:", err);
  }
  return map;
}

/** Resolve a template to its override, or the code default. */
export function resolveTemplate(
  slug: string,
  overrides?: TemplateOverrides
): { subject: string; body: string } {
  const override = overrides?.get(slug);
  const def = EMAIL_TEMPLATES_BY_SLUG[slug];
  return {
    subject: override?.subject ?? def?.defaultSubject ?? "",
    body: override?.body ?? def?.defaultBody ?? "",
  };
}

/** Resolve + substitute tokens in one step. */
export function renderFromTemplate(
  slug: string,
  values: Record<string, string>,
  overrides?: TemplateOverrides
): { subject: string; text: string } {
  const t = resolveTemplate(slug, overrides);
  return {
    subject: renderTemplate(t.subject, values),
    text: renderTemplate(t.body, values),
  };
}

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

/** The conditional in-person paragraph, or empty (used by welcome/returning). */
function inPersonNote(sessions: SessionLine[]): string {
  return sessions.some((s) => s.requested)
    ? "\nAbout the in-person reset: places are limited, so I confirm each one personally. You'll get an email from me either way.\n"
    : "";
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  sessions: SessionLine[],
  personId: string
) {
  const { subject, text } = renderFromTemplate(
    "welcome",
    {
      name: firstName,
      sessions: sessionListText(sessions),
      calendar_links: calendarLinksText(sessions),
      in_person_note: inPersonNote(sessions),
    },
    await loadTemplateOverrides()
  );

  await sendBrandedEmail({
    to: email,
    subject,
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
  const { subject, text } = renderFromTemplate(
    "returning",
    {
      name: firstName,
      sessions: sessionListText(sessions),
      calendar_links: calendarLinksText(sessions),
      in_person_note: inPersonNote(sessions),
    },
    await loadTemplateOverrides()
  );

  await sendBrandedEmail({
    to: email,
    subject,
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
  const { subject, text } = renderFromTemplate(
    "approval",
    {
      name: firstName,
      session_title: session.title,
      dates: session.rangeLabel,
      location_line: session.location ? `\nLocation: ${session.location}` : "",
    },
    await loadTemplateOverrides()
  );

  await sendBrandedEmail({
    to: email,
    subject,
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
  const { subject, text } = renderFromTemplate(
    "decline",
    {
      name: firstName,
      session_title: session.title,
      dates: session.rangeLabel,
    },
    await loadTemplateOverrides()
  );

  await sendBrandedEmail({
    to: email,
    subject,
    text,
    preheader: "An update on your in-person reset request.",
    log: { personId, type: "decline", sessionId: session.id ?? null },
  });
}
