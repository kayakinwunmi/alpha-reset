"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SessionRow,
  RegistrationRow,
  sessionRangeLabel,
} from "@/lib/session-types";
import { card, btnPrimary, btnGhost, inputClass, formatDate } from "./ui";

interface Person {
  id: string;
  first_name: string;
  email: string;
}

const EMPTY_FORM = {
  id: "",
  title: "",
  startDate: "",
  endDate: "",
  kind: "virtual",
  location: "",
  capacity: "",
  notes: "",
  status: "open",
};

type SessionForm = typeof EMPTY_FORM;

function toForm(s: SessionRow): SessionForm {
  return {
    id: s.id,
    title: s.title,
    startDate: s.starts_at.slice(0, 10),
    endDate: s.ends_at.slice(0, 10),
    kind: s.kind,
    location: s.location || "",
    capacity: s.capacity ? String(s.capacity) : "",
    notes: s.notes || "",
    status: s.status,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function SessionEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: SessionForm;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isNew = !form.id;

  const set = (patch: Partial<SessionForm>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      // Convention: the fast starts at midnight UTC and ends 6pm UTC.
      const payload = {
        id: form.id || undefined,
        title: form.title.trim(),
        starts_at: `${form.startDate}T00:00:00Z`,
        ends_at: `${form.endDate}T18:00:00Z`,
        kind: form.kind,
        location: form.kind === "in_person" ? form.location.trim() || null : null,
        capacity: form.kind === "in_person" && form.capacity ? Number(form.capacity) : null,
        notes: form.notes.trim() || null,
        status: form.status,
      };
      const res = await fetch("/api/admin/sessions", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(isNew ? `Created "${payload.title}"` : `Updated "${payload.title}"`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  const labelCls = "block text-xs font-sans text-[var(--ink-faint)] mb-1 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4 md:p-10">
      <div className="bg-[var(--paper)] border border-[var(--rule)] w-full max-w-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-[var(--ink)]">
            {isNew ? "New session" : "Edit session"}
          </h2>
          <button onClick={onClose} className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder='e.g. "Q3 Reset" or "Forest Retreat 2026"'
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Starts (midnight)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  set({
                    startDate,
                    // Keep the usual 3-day shape unless the end was customised.
                    endDate:
                      !form.endDate || form.endDate === addDays(form.startDate || startDate, 2)
                        ? addDays(startDate, 2)
                        : form.endDate,
                  });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelCls}>Ends (6pm)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set({ endDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Kind</label>
              <select
                value={form.kind}
                onChange={(e) => set({ kind: e.target.value })}
                className={inputClass}
              >
                <option value="virtual">Virtual (everyone at home)</option>
                <option value="in_person">In person (request + approval)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set({ status: e.target.value })}
                className={inputClass}
              >
                <option value="open">Open (on the site)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {form.kind === "in_person" && (
            <>
              <div>
                <label className={labelCls}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set({ location: e.target.value })}
                  placeholder='e.g. "A house in the Scottish Highlands"'
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelCls}>Places (shown on the site)</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => set({ capacity: e.target.value })}
                  placeholder="e.g. 10"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label className={labelCls}>Public note (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder='e.g. "Shared costs — details in the group"'
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-700 text-sm font-sans">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className={btnGhost}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !form.title.trim() || !form.startDate || !form.endDate}
              className={btnPrimary}
            >
              {saving ? "Saving..." : isNew ? "Create session" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessionsPanel({
  sessions,
  registrations,
  people,
  onToast,
}: {
  sessions: SessionRow[];
  registrations: RegistrationRow[];
  people: Person[];
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SessionForm | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const sessionsById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const countsBySession = useMemo(() => {
    const counts = new Map<string, { confirmed: number; requested: number }>();
    for (const r of registrations) {
      const c = counts.get(r.session_id) || { confirmed: 0, requested: 0 };
      if (r.status === "confirmed") c.confirmed += 1;
      if (r.status === "requested") c.requested += 1;
      counts.set(r.session_id, c);
    }
    return counts;
  }, [registrations]);

  const pending = useMemo(
    () =>
      registrations
        .filter((r) => r.status === "requested")
        .map((r) => ({
          reg: r,
          person: peopleById.get(r.person_id),
          session: sessionsById.get(r.session_id),
        }))
        .filter((p) => p.person && p.session),
    [registrations, peopleById, sessionsById]
  );

  const decide = async (regId: string, action: "approve" | "decline", name: string) => {
    if (action === "decline" && !window.confirm(`Decline ${name}'s request? They'll get a polite email.`)) {
      return;
    }
    setBusyId(regId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: regId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onToast(
        action === "approve"
          ? `Approved ${name} — confirmation email ${data.emailSent ? "sent" : "FAILED, follow up manually"}`
          : `Declined ${name} — email ${data.emailSent ? "sent" : "FAILED, follow up manually"}`
      );
      router.refresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const deleteSession = async (s: SessionRow) => {
    if (!window.confirm(`Delete "${s.title}"? Only possible while nobody is registered.`)) return;
    setBusyId(s.id);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      onToast(`Deleted "${s.title}"`);
      router.refresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const statusStyle: Record<string, string> = {
    open: "border-[var(--accent)] text-[var(--accent)]",
    draft: "border-[var(--rule)] text-[var(--ink-faint)]",
    completed: "border-[var(--rule)] text-[var(--ink-faint)] line-through",
    cancelled: "border-red-300 text-red-700",
  };

  return (
    <>
      {/* Pending in-person requests */}
      {pending.length > 0 && (
        <section className="mb-8 border border-[var(--accent)] bg-white/70 p-5">
          <p className="font-sans text-xs uppercase tracking-wider text-[var(--accent)] mb-4">
            Awaiting your decision — {pending.length} in-person request{pending.length === 1 ? "" : "s"}
          </p>
          <ul className="space-y-3">
            {pending.map(({ reg, person, session }) => (
              <li key={reg.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] last:border-0 pb-3 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[var(--ink)]">
                    {person!.first_name}{" "}
                    <span className="font-sans text-xs text-[var(--ink-faint)]">{person!.email}</span>
                  </p>
                  <p className="font-sans text-xs text-[var(--ink-faint)]">
                    {session!.title} · {sessionRangeLabel(session!.starts_at, session!.ends_at)}
                    {reg.intention ? (
                      <span className="italic"> · &ldquo;{reg.intention}&rdquo;</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => decide(reg.id, "approve", person!.first_name)}
                    disabled={busyId === reg.id}
                    className={btnPrimary}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(reg.id, "decline", person!.first_name)}
                    disabled={busyId === reg.id}
                    className={btnGhost}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sessions */}
      <section className={`${card} mb-8`}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)]">
            Sessions
          </p>
          <button onClick={() => setEditing({ ...EMPTY_FORM })} className={btnPrimary}>
            + New session
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="font-sans text-sm text-[var(--ink-faint)]">
            No sessions yet. Create the next reset — it appears on the site immediately.
            (If you just deployed, run supabase-migration-2.sql first.)
          </p>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {sessions.map((s) => {
              const counts = countsBySession.get(s.id) || { confirmed: 0, requested: 0 };
              return (
                <li key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg text-[var(--ink)]">
                      {sessionRangeLabel(s.starts_at, s.ends_at)}
                      {s.kind === "in_person" && (
                        <span className="ml-2 align-middle inline-block px-1.5 py-0.5 font-sans text-[10px] tracking-[0.15em] uppercase bg-[var(--accent)] text-white">
                          In person
                        </span>
                      )}
                      <span
                        className={`ml-2 align-middle inline-block px-1.5 py-0.5 font-sans text-[10px] tracking-[0.15em] uppercase border ${statusStyle[s.status] || statusStyle.draft}`}
                      >
                        {s.status}
                      </span>
                    </p>
                    <p className="font-sans text-xs text-[var(--ink-faint)]">
                      {s.title}
                      {s.location ? ` · ${s.location}` : ""}
                      {" · "}
                      {counts.confirmed} confirmed
                      {counts.requested > 0 ? `, ${counts.requested} requested` : ""}
                      {s.capacity ? ` · ${s.capacity} places` : ""}
                      {" · created "}
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/api/calendar?session=${s.id}`}
                      className={btnGhost}
                      title="Download .ics for this session"
                    >
                      .ics
                    </a>
                    <button onClick={() => setEditing(toForm(s))} className={btnGhost}>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSession(s)}
                      disabled={busyId === s.id}
                      className={btnGhost}
                      title="Delete (only when empty)"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing && (
        <SessionEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            onToast(msg);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
