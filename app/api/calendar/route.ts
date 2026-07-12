import { NextRequest, NextResponse } from "next/server";
import { SITE_URL, BESTDAY_URL } from "@/lib/event";
import { getNextSession, getSessionById } from "@/lib/sessions";
import { sessionRangeLabel } from "@/lib/session-types";

// Downloadable .ics so people can block the dates the moment they sign up.
// /api/calendar            → the next upcoming session
// /api/calendar?session=id → a specific session
//
// The event is ALL-DAY spanning the session dates: session times are stored
// in UTC, and timed entries would show as 1am–7pm for UK users in summer.
// All-day is timezone-proof and matches how people actually block the days.

/** "20260624" — date-only ICS value from an ISO timestamp. */
function icsDate(iso: string, addDays = 0): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function icsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session");
  const session = sessionId
    ? (await getSessionById(sessionId)) || (await getNextSession())
    : await getNextSession();

  const rangeLabel = sessionRangeLabel(session.starts_at, session.ends_at);

  const uid = `alpha-reset-${session.id}@alphareset.co`;
  const descriptionParts = [
    "72 hours. No food. No distractions. A water fast + deep life review.",
    "Last meal by 6pm the evening before; the fast ends at 6pm on the final day.",
    "",
    `Field Guide: ${SITE_URL}/guide`,
    `Group on Bestday: ${BESTDAY_URL}`,
  ];
  if (session.kind === "in_person" && session.location) {
    descriptionParts.unshift(`In person: ${session.location}`, "");
  }
  const description = descriptionParts.map(escapeIcsText).join("\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alpha Reset//alphareset.co//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    // All-day event; DTEND is exclusive, so it's the day after the end date.
    `DTSTART;VALUE=DATE:${icsDate(session.starts_at)}`,
    `DTEND;VALUE=DATE:${icsDate(session.ends_at, 1)}`,
    `SUMMARY:${escapeIcsText(`${session.title} — ${rangeLabel}`)}`,
    `DESCRIPTION:${description}`,
    `URL:${SITE_URL}`,
    "STATUS:CONFIRMED",
  ];
  if (session.kind === "in_person" && session.location) {
    lines.push(`LOCATION:${escapeIcsText(session.location)}`);
  }
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-P2D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Alpha Reset starts in 48 hours — eat well, hydrate, prepare.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alpha-reset.ics"',
    },
  });
}
