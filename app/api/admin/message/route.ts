import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { sendBrandedEmail } from "@/lib/email";

interface Recipient {
  id: string;
  first_name: string;
  email: string;
}

// Broadcast a message to all signups, a selected subset, or everyone
// confirmed for a specific session. Body supports {{name}} personalization;
// every send is wrapped in the branded template so broadcasts look like the
// rest of the sequence.
export async function POST(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, recipientIds, sessionId } = await req.json().catch(() => ({}));

  if (!subject || !body || typeof subject !== "string" || typeof body !== "string") {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  const supabase = getSupabase();
  let recipients: Recipient[] = [];
  let audience = "all";

  if (sessionId && typeof sessionId === "string") {
    // Everyone confirmed for one session.
    const [{ data: session }, { data: regs, error: regErr }] = await Promise.all([
      supabase.from("sessions").select("title").eq("id", sessionId).single(),
      supabase
        .from("registrations")
        .select("person:signups(id, first_name, email)")
        .eq("session_id", sessionId)
        .eq("status", "confirmed"),
    ]);
    if (regErr) {
      return NextResponse.json({ error: "Failed to fetch session recipients" }, { status: 500 });
    }
    recipients = (regs || [])
      .map((r) => (Array.isArray(r.person) ? r.person[0] : r.person) as Recipient | null)
      .filter((p): p is Recipient => Boolean(p));
    audience = `session: ${session?.title || sessionId}`;
  } else if (recipientIds === "all" || Array.isArray(recipientIds)) {
    if (Array.isArray(recipientIds) && recipientIds.length === 0) {
      return NextResponse.json({ error: "No recipients selected" }, { status: 400 });
    }
    let query = supabase.from("signups").select("id, first_name, email");
    if (recipientIds !== "all") {
      query = query.in("id", recipientIds);
      audience = "selected";
    }
    const { data, error } = await query;
    if (error || !data) {
      return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
    }
    recipients = data as Recipient[];
  } else {
    return NextResponse.json(
      { error: "Provide recipientIds (\"all\" or an array of ids) or a sessionId" },
      { status: 400 }
    );
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients matched" }, { status: 400 });
  }

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const r of recipients) {
    const firstName = r.first_name.split(" ")[0];
    try {
      await sendBrandedEmail({
        to: r.email,
        subject: subject.replace(/\{\{name\}\}/g, firstName),
        text: body.replace(/\{\{name\}\}/g, firstName),
      });
      sent.push(r.email);
    } catch (err) {
      failed.push({ email: r.email, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Log the broadcast — best-effort, the messages table may not be migrated yet.
  try {
    await supabase.from("messages").insert({
      subject,
      body,
      recipient_count: sent.length,
      audience,
    });
  } catch (logErr) {
    console.error("Failed to log broadcast:", logErr);
  }

  return NextResponse.json({
    success: failed.length === 0,
    sentCount: sent.length,
    failed,
  });
}
