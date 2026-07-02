import { NextResponse } from "next/server";
import { EVENT_START, EVENT_END, EVENT_RANGE_LABEL, SITE_URL, BESTDAY_URL } from "@/lib/event";

// Downloadable .ics so people can block the dates the moment they sign up.

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function GET() {
  const uid = `alpha-reset-${icsDate(EVENT_START)}@alphareset.co`;
  const description =
    "72 hours. No food. No distractions. A water fast + deep life review." +
    "\\n\\nField Guide: " + SITE_URL + "/guide" +
    "\\nGroup on Bestday: " + BESTDAY_URL;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alpha Reset//alphareset.co//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(EVENT_START)}`,
    `DTSTART:${icsDate(EVENT_START)}`,
    `DTEND:${icsDate(EVENT_END)}`,
    `SUMMARY:Alpha Reset — ${EVENT_RANGE_LABEL}`,
    `DESCRIPTION:${description}`,
    `URL:${SITE_URL}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P2D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Alpha Reset starts in 48 hours — eat well, hydrate, prepare.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alpha-reset.ics"',
    },
  });
}
