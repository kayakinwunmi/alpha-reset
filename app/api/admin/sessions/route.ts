import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

const EDITABLE_FIELDS = [
  "title",
  "starts_at",
  "ends_at",
  "kind",
  "location",
  "capacity",
  "notes",
  "status",
] as const;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function pickFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of EDITABLE_FIELDS) {
    if (f in body) out[f] = body[f];
  }
  return out;
}

function validate(fields: Record<string, unknown>, requireAll: boolean): string | null {
  if (requireAll) {
    if (!fields.title || !fields.starts_at || !fields.ends_at) {
      return "Title, start and end are required";
    }
  }
  if (fields.starts_at && fields.ends_at) {
    if (new Date(String(fields.ends_at)) <= new Date(String(fields.starts_at))) {
      return "End must be after start";
    }
  }
  if (fields.kind && !["virtual", "in_person"].includes(String(fields.kind))) {
    return "Invalid kind";
  }
  if (fields.status && !["draft", "open", "completed", "cancelled"].includes(String(fields.status))) {
    return "Invalid status";
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const fields = pickFields(body);
  const invalid = validate(fields, true);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { data, error } = await getSupabase().from(T.sessions).insert(fields).select().single();
  if (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
  return NextResponse.json({ success: true, session: data });
}

export async function PATCH(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const fields = pickFields(body);
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const invalid = validate(fields, false);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { error } = await getSupabase().from(T.sessions).update(fields).eq("id", id);
  if (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { id } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { count } = await supabase
    .from(T.registrations)
    .select("id", { count: "exact", head: true })
    .eq("session_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `This session has ${count} registration${count === 1 ? "" : "s"} — cancel it instead of deleting.` },
      { status: 409 }
    );
  }

  const { error } = await supabase.from(T.sessions).delete().eq("id", id);
  if (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
