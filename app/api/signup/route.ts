import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendWelcomeEmail, sendReturningEmail, SessionLine } from "@/lib/email";
import { FALLBACK_SESSION } from "@/lib/event";
import { SessionRow, sessionRangeLabel } from "@/lib/session-types";

interface Outcome {
  sessionId: string;
  title: string;
  rangeLabel: string;
  outcome: "confirmed" | "requested" | "already";
}

// Registers a person for one or more sessions. The person row is upserted by
// email, so returning members can register for future sessions; per-session
// state (status, intention, drip progress) lives on registrations.
export async function POST(req: NextRequest) {
  try {
    const { firstName, email, phone, intention, sessionIds, company, _t } = await req.json();

    // Honeypot check — bots fill hidden fields
    if (company) {
      return NextResponse.json({ success: true, outcomes: [] }); // Silent fail
    }

    // Time check — form submitted too fast (< 3 seconds = bot)
    if (typeof _t === "number" && _t < 3000) {
      return NextResponse.json({ success: true, outcomes: [] }); // Silent fail
    }

    if (!firstName || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const ids: string[] = Array.isArray(sessionIds)
      ? sessionIds.filter((s: unknown) => typeof s === "string")
      : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "Pick at least one reset to join" }, { status: 400 });
    }

    const supabase = getSupabase();
    const person = {
      first_name: String(firstName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
    };
    const cleanIntention = intention ? String(intention).trim().slice(0, 1000) : null;

    // Legacy mode: sessions migration not run yet (or the site rendered the
    // fallback session) — save the signup the old way so nobody is lost.
    const wantsFallback = ids.includes(FALLBACK_SESSION.id);

    // Look up the selected sessions.
    let sessions: SessionRow[] = [];
    let sessionsTableMissing = false;
    if (!wantsFallback) {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .in("id", ids)
        .eq("status", "open");
      if (error) {
        if (error.code === "42P01") sessionsTableMissing = true;
        else {
          console.error("Sessions lookup error:", error);
          return NextResponse.json({ error: "Failed to load sessions. Try again." }, { status: 500 });
        }
      } else {
        sessions = (data as SessionRow[]) || [];
      }
    }

    if (wantsFallback || sessionsTableMissing) {
      return legacySignup(person, cleanIntention);
    }

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "Those sessions are no longer open — refresh the page and try again." },
        { status: 400 }
      );
    }

    // Upsert the person by email.
    let personId: string;
    let returning = false;
    const { data: existing } = await supabase
      .from("signups")
      .select("id")
      .eq("email", person.email)
      .maybeSingle();

    if (existing) {
      personId = existing.id;
      returning = true;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("signups")
        .insert(person)
        .select("id")
        .single();
      if (insertErr) {
        if (insertErr.code === "23505") {
          // Raced with another submit — fetch the row that won.
          const { data: raced } = await supabase
            .from("signups")
            .select("id")
            .eq("email", person.email)
            .single();
          if (!raced) throw insertErr;
          personId = raced.id;
          returning = true;
        } else {
          console.error("Supabase error:", insertErr);
          return NextResponse.json({ error: "Failed to save. Try again." }, { status: 500 });
        }
      } else {
        personId = inserted.id;
      }
    }

    // Create registrations; duplicates mean "already registered".
    const rows = sessions.map((s) => ({
      person_id: personId,
      session_id: s.id,
      status: s.kind === "in_person" ? "requested" : "confirmed",
      intention: cleanIntention,
    }));
    const { data: createdRows, error: regErr } = await supabase
      .from("registrations")
      .upsert(rows, { onConflict: "person_id,session_id", ignoreDuplicates: true })
      .select("session_id, status");

    if (regErr) {
      console.error("Registration error:", regErr);
      return NextResponse.json({ error: "Failed to save. Try again." }, { status: 500 });
    }

    const createdBySession = new Map((createdRows || []).map((r) => [r.session_id, r.status]));
    const outcomes: Outcome[] = sessions.map((s) => {
      const created = createdBySession.get(s.id);
      return {
        sessionId: s.id,
        title: s.title,
        rangeLabel: sessionRangeLabel(s.starts_at, s.ends_at),
        outcome: created ? (created === "requested" ? "requested" : "confirmed") : "already",
      };
    });

    // Email — only about newly-created registrations.
    const newLines: SessionLine[] = outcomes
      .filter((o) => o.outcome !== "already")
      .map((o) => ({ title: o.title, rangeLabel: o.rangeLabel, requested: o.outcome === "requested" }));
    if (newLines.length > 0) {
      const firstNameOnly = person.first_name.split(" ")[0];
      try {
        if (returning) {
          await sendReturningEmail(person.email, firstNameOnly, newLines);
        } else {
          await sendWelcomeEmail(person.email, firstNameOnly, newLines);
        }
      } catch (emailError) {
        console.error("Resend error:", emailError);
        // Don't fail the signup if email fails
      }
    }

    return NextResponse.json({ success: true, outcomes, returning });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/** Pre-sessions-migration behavior: one list, one welcome email. */
async function legacySignup(
  person: { first_name: string; email: string; phone: string },
  intention: string | null
) {
  const supabase = getSupabase();
  const row = { ...person, intention };

  let { error: dbError } = await supabase.from("signups").insert(row);
  if (dbError && (dbError.code === "42703" || dbError.code === "PGRST204")) {
    ({ error: dbError } = await supabase.from("signups").insert(person));
  }

  const fallbackLine: SessionLine = {
    title: FALLBACK_SESSION.title,
    rangeLabel: sessionRangeLabel(FALLBACK_SESSION.starts_at, FALLBACK_SESSION.ends_at),
    requested: false,
  };
  const outcomes: Outcome[] = [
    {
      sessionId: FALLBACK_SESSION.id,
      title: fallbackLine.title,
      rangeLabel: fallbackLine.rangeLabel,
      outcome: "confirmed",
    },
  ];

  if (dbError) {
    if (dbError.code === "23505") {
      return NextResponse.json(
        { success: true, outcomes: outcomes.map((o) => ({ ...o, outcome: "already" })), returning: true }
      );
    }
    console.error("Supabase error:", dbError);
    return NextResponse.json({ error: "Failed to save. Try again." }, { status: 500 });
  }

  try {
    await sendWelcomeEmail(person.email, person.first_name.split(" ")[0], [fallbackLine]);
  } catch (emailError) {
    console.error("Resend error:", emailError);
  }

  return NextResponse.json({ success: true, outcomes, returning: false });
}
