"use client";

import { useEffect, useMemo } from "react";
import {
  SessionRow,
  RegistrationRow,
  sessionRangeLabel,
} from "@/lib/session-types";
import type { Signup, Broadcast, EmailLogRow } from "./AdminDashboard";
import { btnGhost, btnPrimary, formatDate } from "./ui";

const EMAIL_TYPE_LABEL: Record<string, string> = {
  welcome: "Welcome",
  returning: "Registration confirmed",
  story: "Story email",
  drip: "Countdown",
  approval: "Place confirmed",
  decline: "Place update",
  broadcast: "Broadcast",
};

// Copy that mirrors lib/drip-emails.ts so we can name the emails a person has
// received. Derived view: we know WHICH emails were sent (from drip_stage /
// story_stage) and the date of the most recent drip (last_drip_at); earlier
// sends aren't individually timestamped.
const STORY_SUBJECT = "Why I started Alpha Reset";
const SESSION_DRIP_SUBJECTS = [
  "How to prepare for Alpha Reset", // stage 1
  "48 hours to go", // stage 2
  "Day 1: Reset", // stage 3
  "Day 2: Reflect", // stage 4
  "Day 3: Focus", // stage 5
  "You did it 🦾", // stage 6
];

const STAGE_LABELS = ["Registered", "Prep", "48h", "Day 1", "Day 2", "Day 3", "Complete"];

const REG_BADGE: Record<string, string> = {
  confirmed: "border-[var(--accent)] text-[var(--accent)]",
  requested: "border-amber-500 text-amber-700",
  declined: "border-[var(--rule)] text-[var(--ink-faint)] line-through",
};

const STATUS_WORD: Record<string, string> = {
  confirmed: "Confirmed",
  requested: "Awaiting approval",
  declined: "Declined",
};

/** "1 year, 4 months ago" / "3 days ago" — coarse, for the "member since" line. */
function relativeSince(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 31) return `${days} days ago`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0
    ? `${years} year${years === 1 ? "" : "s"} ago`
    : `${years}y ${rem}m ago`;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mb-3">
      {children}
    </p>
  );
}

interface EmailEvent {
  subject: string;
  when: string | null; // formatted date, or null if not individually dated
  context?: string; // e.g. session title / broadcast audience
}

export function PersonDrawer({
  person,
  registrations,
  sessionsById,
  broadcasts,
  emailLog,
  onClose,
  onMessage,
  onRemove,
  removing,
}: {
  person: Signup;
  registrations: RegistrationRow[];
  sessionsById: Map<string, SessionRow>;
  broadcasts: Broadcast[];
  emailLog: EmailLogRow[];
  onClose: () => void;
  onMessage: (person: Signup) => void;
  onRemove: (person: Signup) => void;
  removing: boolean;
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const regs = useMemo(
    () =>
      registrations
        .map((r) => ({ reg: r, session: sessionsById.get(r.session_id) }))
        .filter((x): x is { reg: RegistrationRow; session: SessionRow } => Boolean(x.session))
        .sort(
          (a, b) =>
            new Date(b.session.starts_at).getTime() - new Date(a.session.starts_at).getTime()
        ),
    [registrations, sessionsById]
  );

  const confirmedTitles = useMemo(
    () =>
      new Set(
        regs
          .filter((x) => x.reg.status === "confirmed")
          .map((x) => x.session.title)
      ),
    [regs]
  );

  // Derived email history, newest-ish first. Drip emails whose exact date we
  // don't have (everything before the latest per registration) are dated null.
  const emails = useMemo(() => {
    const events: EmailEvent[] = [];

    if ((person.story_stage || 0) >= 1) {
      events.push({ subject: STORY_SUBJECT, when: null, context: "Story email" });
    }

    for (const { reg, session } of regs) {
      const stage = Math.min(Math.max(reg.drip_stage || 0, 0), 6);
      for (let i = 1; i <= stage; i++) {
        events.push({
          subject: SESSION_DRIP_SUBJECTS[i - 1],
          // Only the most recent drip for this registration is dated.
          when: i === stage && reg.last_drip_at ? formatDate(reg.last_drip_at) : null,
          context: session.title,
        });
      }
    }

    // Broadcasts we can attribute: everyone-sends, and per-session sends to a
    // session this person is confirmed for. "Selected" broadcasts can't be
    // attributed to individuals, so they're omitted.
    const likelyBroadcasts = broadcasts.filter((b) => {
      if (b.audience === "all") return true;
      if (b.audience.startsWith("session: ")) {
        return confirmedTitles.has(b.audience.slice("session: ".length));
      }
      return false;
    });
    for (const b of likelyBroadcasts) {
      events.push({
        subject: b.subject,
        when: formatDate(b.created_at),
        context: b.audience === "all" ? "Broadcast · everyone" : "Broadcast · session",
      });
    }

    return events;
  }, [person.story_stage, regs, broadcasts, confirmedTitles]);

  // Real, exactly-dated history from ar_email_log — preferred when present.
  const loggedEmails = useMemo<EmailEvent[]>(
    () =>
      emailLog.map((e) => ({
        subject: e.subject,
        when: formatDate(e.created_at),
        context: e.session_id
          ? sessionsById.get(e.session_id)?.title || EMAIL_TYPE_LABEL[e.type] || e.type
          : EMAIL_TYPE_LABEL[e.type] || e.type,
      })),
    [emailLog, sessionsById]
  );

  const useLog = loggedEmails.length > 0;
  const shownEmails = useLog ? loggedEmails : emails;

  const confirmedCount = regs.filter((x) => x.reg.status === "confirmed").length;
  const requestedCount = regs.filter((x) => x.reg.status === "requested").length;

  const firstName = person.first_name.split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <aside className="relative w-full max-w-md bg-[var(--paper)] border-l border-[var(--rule)] h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--paper)] border-b border-[var(--rule)] px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-light text-[var(--ink)] truncate">{person.first_name}</h2>
            <a
              href={`mailto:${person.email}`}
              className="font-sans text-sm text-[var(--ink-light)] hover:text-[var(--accent)] break-all"
            >
              {person.email}
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-2xl leading-none shrink-0"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-8">
          {/* At a glance */}
          <section>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-[var(--rule)] py-3">
                <p className="text-2xl font-light text-[var(--ink)] tabular-nums">{confirmedCount}</p>
                <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--ink-faint)] mt-1">
                  Confirmed
                </p>
              </div>
              <div className="border border-[var(--rule)] py-3">
                <p className="text-2xl font-light text-[var(--ink)] tabular-nums">{requestedCount}</p>
                <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--ink-faint)] mt-1">
                  Requested
                </p>
              </div>
              <div className="border border-[var(--rule)] py-3">
                <p className="text-2xl font-light text-[var(--ink)] tabular-nums">{shownEmails.length}</p>
                <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--ink-faint)] mt-1">
                  Emails
                </p>
              </div>
            </div>
          </section>

          {/* Details */}
          <section>
            <Label>Details</Label>
            <dl className="space-y-2 font-sans text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-faint)]">Phone</dt>
                <dd className="text-[var(--ink)] text-right">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="hover:text-[var(--accent)]">
                      {person.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-faint)]">First joined</dt>
                <dd className="text-[var(--ink)] text-right">
                  {formatDate(person.created_at)}{" "}
                  <span className="text-[var(--ink-faint)]">({relativeSince(person.created_at)})</span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-faint)]">Story email</dt>
                <dd className="text-[var(--ink)] text-right">
                  {(person.story_stage || 0) >= 1 ? "Sent" : "Not yet"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Sessions */}
          <section>
            <Label>Sessions ({regs.length})</Label>
            {regs.length === 0 ? (
              <p className="font-sans text-sm text-[var(--ink-faint)]">
                Not registered for any session yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {regs.map(({ reg, session }) => {
                  const stage = Math.min(Math.max(reg.drip_stage || 0, 0), STAGE_LABELS.length - 1);
                  return (
                    <li key={reg.id} className="border-b border-[var(--rule)] last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[var(--ink)]">{session.title}</p>
                          <p className="font-sans text-xs text-[var(--ink-faint)]">
                            {sessionRangeLabel(session.starts_at, session.ends_at)}
                            {session.kind === "in_person" ? " · In person" : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-block px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider border ${REG_BADGE[reg.status] || REG_BADGE.confirmed}`}
                        >
                          {STATUS_WORD[reg.status] || reg.status}
                        </span>
                      </div>
                      {reg.intention && (
                        <p className="font-sans text-sm italic text-[var(--ink-light)] mt-2">
                          &ldquo;{reg.intention}&rdquo;
                        </p>
                      )}
                      <p className="font-sans text-xs text-[var(--ink-faint)] mt-2">
                        Registered {formatDate(reg.created_at)}
                        {reg.status === "confirmed" && (
                          <>
                            {" · "}Drip: <span className="text-[var(--ink-light)]">{STAGE_LABELS[stage]}</span>
                            {reg.last_drip_at ? ` (last ${formatDate(reg.last_drip_at)})` : ""}
                          </>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Email history */}
          <section>
            <Label>Emails received</Label>
            {shownEmails.length === 0 ? (
              <p className="font-sans text-sm text-[var(--ink-faint)]">No emails sent yet.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {shownEmails.map((e, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 font-sans text-sm">
                      <span className="text-[var(--ink)] min-w-0">
                        {e.subject}
                        {e.context && (
                          <span className="block text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
                            {e.context}
                          </span>
                        )}
                      </span>
                      <span className="text-[var(--ink-faint)] whitespace-nowrap shrink-0">
                        {e.when || "sent"}
                      </span>
                    </li>
                  ))}
                </ul>
                {!useLog && (
                  <p className="font-sans text-[11px] text-[var(--ink-faint)] mt-3 leading-relaxed">
                    Reconstructed from send state — only the most recent countdown email per session is
                    individually dated. &ldquo;Selected&rdquo; broadcasts aren&apos;t attributed to
                    individuals. New emails are logged exactly from here on.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Actions */}
          <section className="flex gap-3 pt-2">
            <button onClick={() => onMessage(person)} className={btnPrimary}>
              Message {firstName}
            </button>
            <button onClick={() => onRemove(person)} disabled={removing} className={btnGhost}>
              {removing ? "Removing…" : "Remove"}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
