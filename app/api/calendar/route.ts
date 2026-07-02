import { NextRequest, NextResponse } from "next/server";
import { SITE_URL, BESTDAY_URL } from "@/lib/event";
import { getNextSession, getSessionById } from "@/lib/sessions";
import { sessionRangeLabel } from "@/lib/session-types";

// Downloadable .ics so people can block the dates the moment they sign up.
// /api/calendar            → the next upcoming session
// /api/calendar?session=id → a specific session

function icsDate(d: Date): string {
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

  const start = new Date(session.starts_at);
  const end = new Date(session.ends_at);
  const rangeLabel = sessionRangeLabel(session.starts_at, session.ends_at);

  const uid = `alpha-reset-${session.id}@alphareset.co`;
  const descriptionParts = [
    "72 hours. No food. No distractions. A water fast + deep life review.",
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
    `DTSTAMP:${icsDate(start)}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
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
