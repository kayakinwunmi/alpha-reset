"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { renderEmail, textToHtml } from "@/lib/email-template";
import {
  SessionRow,
  RegistrationRow,
  sessionRangeLabel,
} from "@/lib/session-types";
import { SessionsPanel } from "./SessionsPanel";
import { PersonDrawer } from "./PersonDrawer";
import { card, btnPrimary, btnGhost, inputClass, formatDate } from "./ui";

export interface Signup {
  id: string;
  first_name: string;
  email: string;
  phone: string | null;
  intention?: string | null;
  story_stage?: number | null;
  created_at: string;
}

export interface Broadcast {
  id: string;
  subject: string;
  body: string;
  recipient_count: number;
  audience: string;
  created_at: string;
}

// registrations.drip_stage 0..6
const STAGE_LABELS = ["Registered", "Prep", "48h", "Day 1", "Day 2", "Day 3", "Complete"];

const REG_BADGE: Record<string, string> = {
  confirmed: "border-[var(--accent)] text-[var(--accent)]",
  requested: "border-amber-500 text-amber-700",
  declined: "border-[var(--rule)] text-[var(--ink-faint)] line-through",
};

function Sparkline({ signups }: { signups: Signup[] }) {
  const { points, total } = useMemo(() => {
    const days = 30;
    const now = new Date();
    const counts = new Array<number>(days).fill(0);
    for (const s of signups) {
      const age = Math.floor(
        (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (age >= 0 && age < days) counts[days - 1 - age] += 1;
    }
    // Cumulative curve over the window
    const cumulative: number[] = [];
    for (const c of counts) {
      cumulative.push((cumulative[cumulative.length - 1] ?? 0) + c);
    }
    const max = Math.max(1, cumulative[cumulative.length - 1]);
    const w = 260;
    const h = 48;
    const pts = cumulative
      .map((v, i) => `${((i / (days - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`)
      .join(" ");
    return { points: pts, total: cumulative[cumulative.length - 1] };
  }, [signups]);

  return (
    <div>
      <svg width="260" height="48" className="block" aria-label={`${total} signups in the last 30 days`}>
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      </svg>
      <p className="font-sans text-xs text-[var(--ink-faint)] mt-1">last 30 days</p>
    </div>
  );
}

function DripFunnel({ regs }: { regs: RegistrationRow[] }) {
  const counts = useMemo(() => {
    const c = new Array<number>(STAGE_LABELS.length).fill(0);
    for (const r of regs) {
      const stage = Math.min(Math.max(r.drip_stage || 0, 0), STAGE_LABELS.length - 1);
      c[stage] += 1;
    }
    return c;
  }, [regs]);
  const max = Math.max(1, ...counts);

  return (
    <div className="space-y-1.5">
      {STAGE_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <span className="font-sans text-xs text-[var(--ink-faint)] w-24 shrink-0 text-right">
            {label}
          </span>
          <div className="flex-1 h-4 bg-[var(--paper-dark)]">
            <div
              className="h-full bg-[var(--accent)] opacity-80"
              style={{ width: `${(counts[i] / max) * 100}%` }}
            />
          </div>
          <span className="font-sans text-xs text-[var(--ink-light)] w-6">{counts[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Composer({
  signups,
  sessions,
  regsBySession,
  selectedIds,
  onClose,
  onSent,
}: {
  signups: Signup[];
  sessions: SessionRow[];
  regsBySession: Map<string, RegistrationRow[]>;
  selectedIds: string[];
  onClose: () => void;
  onSent: (count: number) => void;
}) {
  const [audience, setAudience] = useState<"all" | "selected" | "session">(
    selectedIds.length > 0 ? "selected" : "all"
  );
  const [sessionId, setSessionId] = useState(sessions[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const sessionCount = (id: string) =>
    (regsBySession.get(id) || []).filter((r) => r.status === "confirmed").length;

  const recipientCount =
    audience === "all"
      ? signups.length
      : audience === "selected"
        ? selectedIds.length
        : sessionCount(sessionId);

  const previewName = signups[0]?.first_name.split(" ")[0] || "Alpha";

  const previewHtml = useMemo(
    () =>
      renderEmail({
        contentHtml: textToHtml(
          (body || "Your message will appear here.").replace(/\{\{name\}\}/g, previewName)
        ),
      }),
    [body, previewName]
  );

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { subject, body };
      if (audience === "session") payload.sessionId = sessionId;
      else payload.recipientIds = audience === "all" ? "all" : selectedIds;

      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      if (data.failed?.length) {
        setError(`Sent ${data.sentCount}, but ${data.failed.length} failed — check Resend logs.`);
      }
      onSent(data.sentCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    `px-3 py-2 border transition-colors disabled:opacity-40 ${
      active ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--rule)] text-[var(--ink-faint)]"
    }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4 md:p-10">
      <div className="bg-[var(--paper)] border border-[var(--rule)] w-full max-w-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-[var(--ink)]">Send a message</h2>
          <button onClick={onClose} className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 font-sans text-xs items-center">
            <button onClick={() => setAudience("all")} className={chip(audience === "all")}>
              Everyone ({signups.length})
            </button>
            <button
              onClick={() => setAudience("selected")}
              disabled={selectedIds.length === 0}
              className={chip(audience === "selected")}
            >
              Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setAudience("session")}
              disabled={sessions.length === 0}
              className={chip(audience === "session")}
            >
              A session
            </button>
            {audience === "session" && (
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className={`${inputClass} w-auto`}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {sessionRangeLabel(s.starts_at, s.ends_at)} ({sessionCount(s.id)} confirmed)
                  </option>
                ))}
              </select>
            )}
          </div>

          <input
            type="text"
            placeholder="Subject — use {{name}} to personalise"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />

          <textarea
            rows={10}
            placeholder={"Hey {{name}},\n\nWrite in plain text — it's sent wrapped in the branded Alpha Reset template. Blank lines make paragraphs; links become clickable."}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${inputClass} resize-y`}
          />

          {showPreview && (
            <iframe
              title="Email preview"
              srcDoc={previewHtml}
              className="w-full h-96 border border-[var(--rule)] bg-white"
            />
          )}

          {error && <p className="text-red-700 text-sm font-sans">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button onClick={() => setShowPreview(!showPreview)} className={btnGhost}>
              {showPreview ? "Hide preview" : "Preview email"}
            </button>
            <button
              onClick={send}
              disabled={sending || !subject.trim() || !body.trim() || recipientCount === 0}
              className={btnPrimary}
            >
              {sending
                ? "Sending..."
                : `Send to ${recipientCount} ${recipientCount === 1 ? "person" : "people"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({
  signups,
  sessions,
  registrations,
  broadcasts,
}: {
  signups: Signup[];
  sessions: SessionRow[];
  registrations: RegistrationRow[];
  broadcasts: Broadcast[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const sessionsById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const regsByPerson = useMemo(() => {
    const m = new Map<string, RegistrationRow[]>();
    for (const r of registrations) {
      const list = m.get(r.person_id) || [];
      list.push(r);
      m.set(r.person_id, list);
    }
    return m;
  }, [registrations]);

  const regsBySession = useMemo(() => {
    const m = new Map<string, RegistrationRow[]>();
    for (const r of registrations) {
      const list = m.get(r.session_id) || [];
      list.push(r);
      m.set(r.session_id, list);
    }
    return m;
  }, [registrations]);

  const now = Date.now();
  const nextSession = useMemo(
    () =>
      sessions.find((s) => s.status === "open" && new Date(s.ends_at).getTime() > now) || null,
    [sessions, now]
  );

  /** Best intention to show for a person: the filtered session's, else the latest. */
  const intentionFor = (personId: string, legacy?: string | null): string | null => {
    const regs = regsByPerson.get(personId) || [];
    if (sessionFilter !== "all") {
      return regs.find((r) => r.session_id === sessionFilter)?.intention || null;
    }
    return regs.find((r) => r.intention)?.intention || legacy || null;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return signups.filter((s) => {
      if (sessionFilter !== "all") {
        const regs = regsByPerson.get(s.id) || [];
        if (!regs.some((r) => r.session_id === sessionFilter && r.status !== "declined")) {
          return false;
        }
      }
      if (!q) return true;
      const intention = intentionFor(s.id, s.intention) || "";
      return (
        s.first_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        intention.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signups, search, sessionFilter, regsByPerson]);

  const stats = useMemo(() => {
    const week = signups.filter(
      (s) => now - new Date(s.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    const daysToEvent = nextSession
      ? Math.max(0, Math.ceil((new Date(nextSession.starts_at).getTime() - now) / (1000 * 60 * 60 * 24)))
      : null;
    const pendingRequests = registrations.filter((r) => r.status === "requested").length;
    return { total: signups.length, week, daysToEvent, pendingRequests };
  }, [signups, registrations, nextSession, now]);

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((s) => s.id))
    );
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSignup = async (s: Signup) => {
    if (!window.confirm(`Remove ${s.first_name} (${s.email}) and all their registrations? This can't be undone.`)) return;
    setDeletingId(s.id);
    try {
      const res = await fetch("/api/admin/signups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id }),
      });
      if (!res.ok) throw new Error();
      setToast(`Removed ${s.first_name}`);
      router.refresh();
    } catch {
      setToast("Delete failed — try again");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    const header = ["first_name", "email", "phone", "sessions", "intention", "created_at"];
    const rows = signups.map((s) => {
      const regs = regsByPerson.get(s.id) || [];
      const sessionList = regs
        .map((r) => {
          const sess = sessionsById.get(r.session_id);
          return sess ? `${sess.title} (${r.status})` : r.session_id;
        })
        .join("; ");
      return [s.first_name, s.email, s.phone || "", sessionList, intentionFor(s.id, s.intention) || "", s.created_at]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alpha-reset-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-[var(--ink-faint)] mb-1">
            Alpha Reset
          </p>
          <h1 className="text-4xl font-light text-[var(--ink)]">The Ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs text-[var(--ink-faint)]">
            {nextSession
              ? `Next reset: ${sessionRangeLabel(nextSession.starts_at, nextSession.ends_at)}`
              : "No upcoming session — create one below"}
          </span>
          <button onClick={logout} className={btnGhost}>
            Log out
          </button>
        </div>
      </header>

      {toast && (
        <div className="mb-6 border border-[var(--accent)] bg-white/70 px-4 py-3 font-sans text-sm text-[var(--ink)] flex justify-between items-center">
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="text-[var(--ink-faint)]">×</button>
        </div>
      )}

      {/* Sessions + approvals */}
      <SessionsPanel
        sessions={sessions}
        registrations={registrations}
        people={signups}
        onToast={setToast}
      />

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "People", value: stats.total },
          { label: "This week", value: stats.week },
          { label: "Days to reset", value: stats.daysToEvent ?? "—" },
          { label: "Pending requests", value: stats.pendingRequests },
        ].map((s) => (
          <div key={s.label} className={card}>
            <p className="text-4xl font-light text-[var(--ink)] tabular-nums">{s.value}</p>
            <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid lg:grid-cols-2 gap-4 mb-8">
        <div className={card}>
          <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mb-4">
            Signup growth
          </p>
          <Sparkline signups={signups} />
        </div>
        <div className={card}>
          <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mb-4">
            Drip progress{nextSession ? ` — ${nextSession.title}` : ""}
          </p>
          {nextSession ? (
            <DripFunnel
              regs={(regsBySession.get(nextSession.id) || []).filter((r) => r.status === "confirmed")}
            />
          ) : (
            <p className="font-sans text-sm text-[var(--ink-faint)]">No upcoming session.</p>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <section className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name, email, intention…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2.5 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none font-sans text-sm"
        />
        <select
          value={sessionFilter}
          onChange={(e) => {
            setSessionFilter(e.target.value);
            setSelected(new Set());
          }}
          className={`${inputClass} w-auto`}
        >
          <option value="all">All sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} · {sessionRangeLabel(s.starts_at, s.ends_at)}
            </option>
          ))}
        </select>
        <button onClick={() => setComposerOpen(true)} disabled={signups.length === 0} className={btnPrimary}>
          {selected.size > 0 ? `Message selected (${selected.size})` : "Send a message"}
        </button>
        <button onClick={exportCsv} disabled={signups.length === 0} className={btnGhost}>
          Export CSV
        </button>
      </section>

      {/* Table */}
      <section className="border border-[var(--rule)] bg-white/50 overflow-x-auto mb-10">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] text-left text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="accent-[var(--accent)]"
                />
              </th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Sessions</th>
              <th className="p-3">Intention</th>
              <th className="p-3">Joined</th>
              {sessionFilter !== "all" && <th className="p-3">Drip stage</th>}
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[var(--ink-faint)]">
                  {signups.length === 0 ? "No signups yet." : "No matches."}
                </td>
              </tr>
            )}
            {filtered.map((s) => {
              const regs = regsByPerson.get(s.id) || [];
              const filteredReg =
                sessionFilter !== "all" ? regs.find((r) => r.session_id === sessionFilter) : null;
              const intention = intentionFor(s.id, s.intention);
              return (
                <tr key={s.id} className="border-b border-[var(--rule)] last:border-0 hover:bg-white/60">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.first_name}`}
                      checked={selected.has(s.id)}
                      onChange={() => toggleOne(s.id)}
                      className="accent-[var(--accent)]"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedPersonId(s.id)}
                      className="text-[var(--ink)] hover:text-[var(--accent)] hover:underline text-left"
                    >
                      {s.first_name}
                    </button>
                  </td>
                  <td className="p-3 text-[var(--ink-light)]">
                    <a href={`mailto:${s.email}`} className="hover:text-[var(--accent)]">{s.email}</a>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {regs.length === 0 && <span className="text-[var(--ink-faint)]">—</span>}
                      {regs.map((r) => {
                        const sess = sessionsById.get(r.session_id);
                        if (!sess) return null;
                        return (
                          <span
                            key={r.id}
                            title={`${sess.title} — ${r.status}`}
                            className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wider border ${REG_BADGE[r.status] || REG_BADGE.confirmed}`}
                          >
                            {sess.title}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3 text-[var(--ink-light)] max-w-56">
                    {intention ? (
                      <span title={intention} className="block truncate italic">
                        &ldquo;{intention}&rdquo;
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 text-[var(--ink-light)] whitespace-nowrap">{formatDate(s.created_at)}</td>
                  {sessionFilter !== "all" && (
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 text-xs border border-[var(--rule)] text-[var(--ink-light)]">
                        {filteredReg
                          ? STAGE_LABELS[Math.min(filteredReg.drip_stage || 0, STAGE_LABELS.length - 1)]
                          : "—"}
                      </span>
                    </td>
                  )}
                  <td className="p-3">
                    <button
                      onClick={() => deleteSignup(s)}
                      disabled={deletingId === s.id}
                      title="Remove person"
                      className="text-[var(--ink-faint)] hover:text-red-700 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Broadcast history */}
      <section className="mb-16">
        <h2 className="text-2xl font-light text-[var(--ink)] mb-4">Sent messages</h2>
        {broadcasts.length === 0 ? (
          <p className="font-sans text-sm text-[var(--ink-faint)]">
            Nothing sent yet. Broadcasts you send from here will be logged.
          </p>
        ) : (
          <ul className="space-y-3">
            {broadcasts.map((b) => (
              <li key={b.id} className={card}>
                <div className="flex flex-wrap justify-between gap-2 mb-1">
                  <p className="text-lg text-[var(--ink)]">{b.subject}</p>
                  <p className="font-sans text-xs text-[var(--ink-faint)]">
                    {formatDate(b.created_at)} · {b.recipient_count} recipient
                    {b.recipient_count === 1 ? "" : "s"} · {b.audience}
                  </p>
                </div>
                <p className="font-sans text-sm text-[var(--ink-light)] line-clamp-2 whitespace-pre-line">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(() => {
        const person = selectedPersonId
          ? signups.find((s) => s.id === selectedPersonId)
          : null;
        if (!person) return null;
        return (
          <PersonDrawer
            person={person}
            registrations={regsByPerson.get(person.id) || []}
            sessionsById={sessionsById}
            broadcasts={broadcasts}
            onClose={() => setSelectedPersonId(null)}
            onMessage={(p) => {
              setSelected(new Set([p.id]));
              setSelectedPersonId(null);
              setComposerOpen(true);
            }}
            onRemove={deleteSignup}
            removing={deletingId === person.id}
          />
        );
      })()}

      {composerOpen && (
        <Composer
          signups={signups}
          sessions={sessions}
          regsBySession={regsBySession}
          selectedIds={[...selected]}
          onClose={() => setComposerOpen(false)}
          onSent={(count) => {
            setComposerOpen(false);
            setSelected(new Set());
            setToast(`Message sent to ${count} ${count === 1 ? "person" : "people"}.`);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}
