import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(req: NextRequest) {
  if (!isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return unauthorized();

  const { id } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await getSupabase().from(T.signups).delete().eq("id", id);
  if (error) {
    console.error("Delete signup error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
