import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";
import { drips, EVENT_DATE } from "@/lib/drip-emails";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Vercel cron calls this daily
// Also protected by a secret so it can't be triggered externally
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const resend = getResend();
  const now = new Date();
  const results: string[] = [];

  // Get all signups
  const { data: signups, error } = await supabase
    .from("signups")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !signups) {
    return NextResponse.json({ error: "Failed to fetch signups", details: error }, { status: 500 });
  }

  for (const signup of signups) {
    const currentStage = signup.drip_stage || 0;
    const signupDate = new Date(signup.created_at);

    // Find the next email to send
    const nextDrip = drips.find((d) => d.stage === currentStage + 1);
    if (!nextDrip) {
      results.push(`${signup.first_name}: all drips sent`);
      continue;
    }

    // Check if it's time to send
    let shouldSend = false;
    const trigger = nextDrip.trigger;

    if (trigger.type === "after_signup") {
      const daysSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24);
      shouldSend = daysSinceSignup >= trigger.days;
    } else if (trigger.type === "before_event") {
      const daysUntilEvent = (EVENT_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      shouldSend = daysUntilEvent <= trigger.days;
    } else if (trigger.type === "after_event") {
      const daysSinceEvent = (now.getTime() - EVENT_DATE.getTime()) / (1000 * 60 * 60 * 24);
      // Event is 3 days, so "after event" means after day 3 (25 March 18:00)
      const eventEnd = new Date("2026-03-25T18:00:00Z");
      const daysSinceEnd = (now.getTime() - eventEnd.getTime()) / (1000 * 60 * 60 * 24);
      shouldSend = daysSinceEnd >= trigger.days;
    } else if (trigger.type === "event_day") {
      const eventDay = new Date(EVENT_DATE);
      eventDay.setDate(eventDay.getDate() + trigger.day - 1);
      // Send if we're on or past this event day
      const isTodayOrPast =
        now.getFullYear() === eventDay.getFullYear() &&
        now.getMonth() === eventDay.getMonth() &&
        now.getDate() >= eventDay.getDate();
      // Also check we haven't gone more than 1 day past
      const daysPast = (now.getTime() - eventDay.getTime()) / (1000 * 60 * 60 * 24);
      shouldSend = isTodayOrPast || (daysPast >= 0 && daysPast <= 1.5);
    }

    // Don't re-send if we already sent today
    if (signup.last_drip_at) {
      const lastSent = new Date(signup.last_drip_at);
      const hoursSinceLastSend = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSend < 20) {
        results.push(`${signup.first_name}: stage ${currentStage}, waiting (sent ${Math.round(hoursSinceLastSend)}h ago)`);
        continue;
      }
    }

    if (!shouldSend) {
      results.push(`${signup.first_name}: stage ${currentStage}, not yet time for stage ${nextDrip.stage}`);
      continue;
    }

    // Send the email
    const firstName = signup.first_name.split(" ")[0]; // Use first name only
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Kay <kay@alphareset.co>",
        to: signup.email,
        subject: nextDrip.subject,
        text: nextDrip.body(firstName),
      });

      // Update stage
      await supabase
        .from("signups")
        .update({ drip_stage: nextDrip.stage, last_drip_at: now.toISOString() })
        .eq("id", signup.id);

      results.push(`${signup.first_name}: ✅ sent stage ${nextDrip.stage} — "${nextDrip.subject}"`);
    } catch (emailErr: any) {
      results.push(`${signup.first_name}: ❌ failed stage ${nextDrip.stage} — ${emailErr.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: signups.length,
    timestamp: now.toISOString(),
    results,
  });
}
