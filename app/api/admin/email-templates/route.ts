import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { EMAIL_TEMPLATES_BY_SLUG } from "@/lib/email-templates";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Save an override for one email template. Content applies to future sends.
export async function PATCH(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { slug, subject, body } = await req.json().catch(() => ({}));
  if (!slug || typeof slug !== "string" || !(slug in EMAIL_TEMPLATES_BY_SLUG)) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }
  if (!subject || !body || typeof subject !== "string" || typeof body !== "string") {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from(T.emailTemplates)
    .upsert(
      { slug, subject: subject.trim(), body, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );

  if (error) {
    console.error("Template save error:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// Reset a template to its code default (delete the override row).
export async function DELETE(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { slug } = await req.json().catch(() => ({}));
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { error } = await getSupabase().from(T.emailTemplates).delete().eq("slug", slug);
  if (error) {
    console.error("Template reset error:", error);
    return NextResponse.json({ error: "Failed to reset template" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
