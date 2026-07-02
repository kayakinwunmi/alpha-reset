import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { AdminDashboard, type Signup, type Broadcast } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const supabase = getSupabase();

  const { data: signups } = await supabase
    .from("signups")
    .select("*")
    .order("created_at", { ascending: false });

  // The messages table may not exist until the migration is run — that's fine.
  const { data: broadcasts } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <AdminDashboard
      signups={(signups as Signup[]) || []}
      broadcasts={(broadcasts as Broadcast[]) || []}
    />
  );
}
