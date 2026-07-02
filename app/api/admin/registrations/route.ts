import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { sendApprovalEmail, sendDeclineEmail } from "@/lib/email";
import { sessionRangeLabel } from "@/lib/session-types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Approve or decline an in-person place request. Both send the person an
// email; approval flips the registration into the normal drip sequence.
export async function PATCH(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { id, action } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string" || !["approve", "decline"].includes(action)) {
    return NextResponse.json({ error: "Need id and action (approve | decline)" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: reg, error: fetchErr } = await supabase
    .from(T.registrations)
    .select(`id, status, person:${T.signups}(first_name, email), session:${T.sessions}(title, starts_at, ends_at, location)`)
    .eq("id", id)
    .single();

  if (fetchErr || !reg) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "confirmed" : "declined";
  const { error: updateErr } = await supabase
    .from(T.registrations)
    .update({ status: newStatus })
    .eq("id", id);

  if (updateErr) {
    console.error("Registration update error:", updateErr);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  const person = (Array.isArray(reg.person) ? reg.person[0] : reg.person) as
    | { first_name: string; email: string }
    | null;
  const session = (Array.isArray(reg.session) ? reg.session[0] : reg.session) as
    | { title: string; starts_at: string; ends_at: string; location: string | null }
    | null;

  let emailSent = false;
  if (person && session) {
    const firstName = person.first_name.split(" ")[0];
    const rangeLabel = sessionRangeLabel(session.starts_at, session.ends_at);
    try {
      if (action === "approve") {
        await sendApprovalEmail(person.email, firstName, {
          title: session.title,
          rangeLabel,
          location: session.location,
        });
      } else {
        await sendDeclineEmail(person.email, firstName, {
          title: session.title,
          rangeLabel,
        });
      }
      emailSent = true;
    } catch (err) {
      console.error("Approval email error:", err);
    }
  }

  return NextResponse.json({ success: true, status: newStatus, emailSent });
}

export async function DELETE(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { id } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await getSupabase().from(T.registrations).delete().eq("id", id);
  if (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
