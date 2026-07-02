import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { sendBrandedEmail } from "@/lib/email";

interface SignupRow {
  id: string;
  first_name: string;
  email: string;
}

// Broadcast a message to all signups or a selected subset.
// Body supports {{name}} personalization; every send is wrapped in the
// branded template so broadcasts look like the rest of the sequence.
export async function POST(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, recipientIds } = await req.json().catch(() => ({}));

  if (!subject || !body || typeof subject !== "string" || typeof body !== "string") {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }
  if (recipientIds !== "all" && !Array.isArray(recipientIds)) {
    return NextResponse.json({ error: "recipientIds must be \"all\" or an array of ids" }, { status: 400 });
  }
  if (Array.isArray(recipientIds) && recipientIds.length === 0) {
    return NextResponse.json({ error: "No recipients selected" }, { status: 400 });
  }

  const supabase = getSupabase();
  let query = supabase.from("signups").select("id, first_name, email");
  if (recipientIds !== "all") {
    query = query.in("id", recipientIds);
  }
  const { data: recipients, error } = await query;

  if (error || !recipients) {
    return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
  }

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const r of recipients as SignupRow[]) {
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
      audience: recipientIds === "all" ? "all" : "selected",
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
