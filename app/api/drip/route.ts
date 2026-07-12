import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { sendBrandedEmail } from "@/lib/email";
import { STORY_DRIPS, SESSION_DRIPS, SessionEmailCtx } from "@/lib/drip-emails";
import { getSessionAfter } from "@/lib/sessions";
import {
  SessionRow,
  sessionRangeLabel,
  sessionStartOrdinal,
  sessionStartWeekday,
  sessionKickoffWeekday,
  sessionMonth,
} from "@/lib/session-types";

const RESEND_GUARD_HOURS = 20;
const DAY_MS = 1000 * 60 * 60 * 24;

interface PersonRef {
  id: string;
  first_name: string;
  email: string;
}

// Vercel cron calls this daily. Two passes:
//   1. Story pass  — "why I started", once per person, 2 days after signup.
//   2. Session pass — the countdown sequence per confirmed registration,
//      timed against that session's dates.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date();
  const results: string[] = [];

  // ---- Pass 1: story emails (person-level) ----------------------------------
  const story = STORY_DRIPS[0];
  const { data: pendingStory, error: storyErr } = await supabase
    .from(T.signups)
    .select("id, first_name, email, created_at, story_stage")
    .or("story_stage.is.null,story_stage.eq.0");

  if (storyErr) {
    // Pre-migration database — skip quietly rather than fail the whole run.
    results.push(`story pass skipped: ${storyErr.message}`);
  } else {
    for (const person of pendingStory || []) {
      const daysSinceSignup = (now.getTime() - new Date(person.created_at).getTime()) / DAY_MS;
      if (daysSinceSignup < story.afterSignupDays) continue;

      const firstName = person.first_name.split(" ")[0];
      try {
        await sendBrandedEmail({
          to: person.email,
          subject: story.subject,
          text: story.body(firstName),
          log: { personId: person.id, type: "story" },
        });
        await supabase.from(T.signups).update({ story_stage: story.stage }).eq("id", person.id);
        results.push(`${person.first_name}: ✅ story — "${story.subject}"`);
      } catch (err) {
        results.push(`${person.first_name}: ❌ story failed — ${errMessage(err)}`);
      }
    }
  }

  // ---- Pass 2: session countdown emails (per registration) ------------------
  // Include sessions that ended in the last week so the day-after email sends.
  const { data: sessions, error: sessionsErr } = await supabase
    .from(T.sessions)
    .select("*")
    .eq("status", "open")
    .gt("ends_at", new Date(now.getTime() - 7 * DAY_MS).toISOString())
    .order("starts_at", { ascending: true });

  if (sessionsErr) {
    results.push(`session pass skipped: ${sessionsErr.message}`);
    return NextResponse.json({ ok: true, timestamp: now.toISOString(), results });
  }

  for (const session of (sessions as SessionRow[]) || []) {
    const following = await getSessionAfter(session);
    const ctx: SessionEmailCtx = {
      rangeLabel: sessionRangeLabel(session.starts_at, session.ends_at),
      startOrdinal: sessionStartOrdinal(session.starts_at),
      startWeekday: sessionStartWeekday(session.starts_at),
      kickoffWeekday: sessionKickoffWeekday(session.starts_at),
      nextResetHint: following ? sessionMonth(following.starts_at) : "next quarter",
    };
    const startsAt = new Date(session.starts_at);
    const endsAt = new Date(session.ends_at);

    const { data: regs, error: regsErr } = await supabase
      .from(T.registrations)
      .select(`id, drip_stage, last_drip_at, person:${T.signups}(id, first_name, email)`)
      .eq("session_id", session.id)
      .eq("status", "confirmed");

    if (regsErr) {
      results.push(`${session.title}: registrations fetch failed — ${regsErr.message}`);
      continue;
    }

    for (const reg of regs || []) {
      const person = (Array.isArray(reg.person) ? reg.person[0] : reg.person) as PersonRef | null;
      if (!person) continue;

      const currentStage = reg.drip_stage || 0;
      const nextDrip = SESSION_DRIPS.find((d) => d.stage === currentStage + 1);
      if (!nextDrip) continue;

      // Is it time?
      let shouldSend = false;
      const trigger = nextDrip.trigger;
      if (trigger.type === "before_event") {
        const daysUntil = (startsAt.getTime() - now.getTime()) / DAY_MS;
        shouldSend = daysUntil <= trigger.days && daysUntil > -1;
      } else if (trigger.type === "event_day") {
        const eventDay = new Date(startsAt);
        eventDay.setDate(eventDay.getDate() + trigger.day - 1);
        const daysPast = (now.getTime() - eventDay.getTime()) / DAY_MS;
        shouldSend = daysPast >= 0 && daysPast <= 1.5;
      } else if (trigger.type === "after_event") {
        const daysSinceEnd = (now.getTime() - endsAt.getTime()) / DAY_MS;
        shouldSend = daysSinceEnd >= trigger.days;
      }
      if (!shouldSend) continue;

      // Don't re-send if we already sent recently.
      if (reg.last_drip_at) {
        const hoursSince = (now.getTime() - new Date(reg.last_drip_at).getTime()) / (1000 * 60 * 60);
        if (hoursSince < RESEND_GUARD_HOURS) {
          results.push(`${person.first_name} @ ${session.title}: waiting (sent ${Math.round(hoursSince)}h ago)`);
          continue;
        }
      }

      const firstName = person.first_name.split(" ")[0];
      try {
        await sendBrandedEmail({
          to: person.email,
          subject: nextDrip.subject,
          text: nextDrip.body(firstName, ctx),
          log: { personId: person.id, type: "drip", sessionId: session.id },
        });
        await supabase
          .from(T.registrations)
          .update({ drip_stage: nextDrip.stage, last_drip_at: now.toISOString() })
          .eq("id", reg.id);
        results.push(`${person.first_name} @ ${session.title}: ✅ stage ${nextDrip.stage} — "${nextDrip.subject}"`);
      } catch (err) {
        results.push(`${person.first_name} @ ${session.title}: ❌ stage ${nextDrip.stage} — ${errMessage(err)}`);
      }
    }
  }

  return NextResponse.json({ ok: true, timestamp: now.toISOString(), results });
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
