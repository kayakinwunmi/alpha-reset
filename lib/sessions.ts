// Server-only session fetching. Every fetcher falls back to the constant
// session in lib/event.ts if the database is unreachable or the sessions
// migration hasn't been run — the public site must never blank out.

import { getSupabase } from "./supabase";
import { T } from "./tables";
import { FALLBACK_SESSION } from "./event";
import { SessionRow } from "./session-types";

export function fallbackSessionRow(): SessionRow {
  return { ...FALLBACK_SESSION };
}

/** Open sessions that haven't ended yet, soonest first. */
export async function getOpenSessions(limit = 6): Promise<SessionRow[]> {
  try {
    const { data, error } = await getSupabase()
      .from(T.sessions)
      .select("*")
      .eq("status", "open")
      .gt("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit);
    if (error || !data || data.length === 0) return [fallbackSessionRow()];
    return data as SessionRow[];
  } catch {
    return [fallbackSessionRow()];
  }
}

export async function getNextSession(): Promise<SessionRow> {
  const sessions = await getOpenSessions(1);
  return sessions[0];
}

export async function getSessionById(id: string): Promise<SessionRow | null> {
  if (id === FALLBACK_SESSION.id) return fallbackSessionRow();
  try {
    const { data, error } = await getSupabase()
      .from(T.sessions)
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as SessionRow;
  } catch {
    return null;
  }
}

/**
 * The open session that follows the given one, if any — used for
 * "the next reset is in September" copy in the final drip email.
 */
export async function getSessionAfter(session: SessionRow): Promise<SessionRow | null> {
  try {
    const { data } = await getSupabase()
      .from(T.sessions)
      .select("*")
      .eq("status", "open")
      .gt("starts_at", session.starts_at)
      .order("starts_at", { ascending: true })
      .limit(1);
    return (data?.[0] as SessionRow) || null;
  } catch {
    return null;
  }
}
