import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { T } from "@/lib/tables";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import type { SessionRow, RegistrationRow } from "@/lib/session-types";
import {
  AdminDashboard,
  type Signup,
  type Broadcast,
  type EmailLogRow,
  type TemplateOverride,
} from "./AdminDashboard";

export const dynamic = "force-dynamic";

// ar_email_log grows one row per email forever. Bound the dashboard fetch so
// the page payload stays small; the drawer further caps to the latest
// EMAILS_PER_PERSON per person (see AdminDashboard). Revisit with a per-person
// SQL function if this global cap is ever regularly hit.
const EMAIL_LOG_FETCH_CAP = 5000;

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const supabase = getSupabase();

  // Sessions/registrations/messages/email-log tables may not exist until their
  // migrations run — a null result just renders an empty state.
  const [
    { data: signups },
    { data: sessions },
    { data: registrations },
    { data: broadcasts },
    { data: emailLog },
    { data: templateOverrides },
  ] = await Promise.all([
    supabase.from(T.signups).select("*").order("created_at", { ascending: false }),
    supabase.from(T.sessions).select("*").order("starts_at", { ascending: true }),
    supabase.from(T.registrations).select("*").order("created_at", { ascending: false }),
    supabase.from(T.messages).select("*").order("created_at", { ascending: false }).limit(20),
    supabase
      .from(T.emailLog)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(EMAIL_LOG_FETCH_CAP),
    supabase.from(T.emailTemplates).select("slug, subject, body, updated_at"),
  ]);

  return (
    <AdminDashboard
      signups={(signups as Signup[]) || []}
      sessions={(sessions as SessionRow[]) || []}
      registrations={(registrations as RegistrationRow[]) || []}
      broadcasts={(broadcasts as Broadcast[]) || []}
      emailLog={(emailLog as EmailLogRow[]) || []}
      templateOverrides={(templateOverrides as TemplateOverride[]) || []}
    />
  );
}
