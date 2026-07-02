import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import type { SessionRow, RegistrationRow } from "@/lib/session-types";
import { AdminDashboard, type Signup, type Broadcast } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const supabase = getSupabase();

  // Sessions/registrations/messages tables may not exist until their
  // migrations run — a null result just renders an empty state.
  const [{ data: signups }, { data: sessions }, { data: registrations }, { data: broadcasts }] =
    await Promise.all([
      supabase.from("signups").select("*").order("created_at", { ascending: false }),
      supabase.from("sessions").select("*").order("starts_at", { ascending: true }),
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

  return (
    <AdminDashboard
      signups={(signups as Signup[]) || []}
      sessions={(sessions as SessionRow[]) || []}
      registrations={(registrations as RegistrationRow[]) || []}
      broadcasts={(broadcasts as Broadcast[]) || []}
    />
  );
}
