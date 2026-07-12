"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { renderEmail, textToHtml } from "@/lib/email-template";
import {
  EMAIL_TEMPLATES,
  renderTemplate,
  type EmailTemplateDef,
} from "@/lib/email-templates";
import type { TemplateOverride } from "./AdminDashboard";
import { btnPrimary, btnGhost, inputClass } from "./ui";

const GROUP_LABEL: Record<string, string> = {
  drip: "Drip sequence",
  transactional: "Transactional",
};

/** Sample token values (bare key → sample) for the live preview. */
function sampleValues(def: EmailTemplateDef): Record<string, string> {
  const v: Record<string, string> = {};
  for (const t of def.tokens) {
    const key = t.token.replace(/[{}]/g, "");
    v[key] = t.sample;
  }
  return v;
}

function Editor({
  def,
  override,
  onClose,
  onToast,
}: {
  def: EmailTemplateDef;
  override: TemplateOverride | undefined;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(override?.subject ?? def.defaultSubject);
  const [body, setBody] = useState(override?.body ?? def.defaultBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const isCustomized = Boolean(override);
  const dirty =
    subject !== (override?.subject ?? def.defaultSubject) ||
    body !== (override?.body ?? def.defaultBody);

  const previewHtml = useMemo(() => {
    const values = sampleValues(def);
    return renderEmail({ contentHtml: textToHtml(renderTemplate(body, values)) });
  }, [body, def]);

  const insertToken = (token: string) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => b + token);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    // Restore caret just after the inserted token.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: def.slug, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onToast(`Saved “${def.label}”`);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm(`Reset “${def.label}” to the original wording?`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: def.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      onToast(`Reset “${def.label}” to default`);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
      setBusy(false);
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="px-6 py-5 space-y-5">
      <button onClick={onClose} className="font-sans text-sm text-[var(--accent)] hover:underline">
        ← All emails
      </button>

      <div>
        <h2 className="text-2xl font-light text-[var(--ink)]">{def.label}</h2>
        <p className="font-sans text-xs text-[var(--ink-faint)] mt-1">Sends: {def.timing}</p>
        {isCustomized && (
          <span className="inline-block mt-2 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider border border-[var(--accent)] text-[var(--accent)]">
            Customized
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-sans text-[var(--ink-faint)] mb-1 uppercase tracking-wider">
          Subject
        </label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-sans text-[var(--ink-faint)] mb-1 uppercase tracking-wider">
          Body
        </label>
        <textarea
          ref={bodyRef}
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
        />
      </div>

      {/* Token palette */}
      <div>
        <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--ink-faint)] mb-2">
          Insert a placeholder (fills in per person when sent)
        </p>
        <div className="flex flex-wrap gap-2">
          {def.tokens.map((t) => (
            <button
              key={t.token}
              type="button"
              onClick={() => insertToken(t.token)}
              title={t.label}
              className="font-mono text-xs px-2 py-1 border border-[var(--rule)] text-[var(--ink-light)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {t.token}
            </button>
          ))}
        </div>
      </div>

      {showPreview && (
        <div>
          <p className="font-sans text-xs text-[var(--ink-faint)] mb-2">
            Subject preview: <span className="text-[var(--ink)]">{renderTemplate(subject, sampleValues(def))}</span>
          </p>
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            className="w-full h-96 border border-[var(--rule)] bg-white"
          />
        </div>
      )}

      {error && <p className="text-red-700 text-sm font-sans">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button onClick={() => setShowPreview((p) => !p)} className={btnGhost}>
          {showPreview ? "Hide preview" : "Preview"}
        </button>
        <div className="flex gap-2">
          {isCustomized && (
            <button onClick={reset} disabled={busy} className={btnGhost}>
              Reset to default
            </button>
          )}
          <button onClick={save} disabled={busy || !dirty} className={btnPrimary}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <p className="font-sans text-[11px] text-[var(--ink-faint)] leading-relaxed">
        Changes apply to future sends. The person&apos;s name, dates and other details fill in
        automatically where you place the placeholders above.
      </p>
    </div>
  );
}

export function EmailTemplatesDrawer({
  overrides,
  onClose,
  onToast,
}: {
  overrides: TemplateOverride[];
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editingSlug) setEditingSlug(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingSlug, onClose]);

  const overrideBySlug = useMemo(
    () => new Map(overrides.map((o) => [o.slug, o])),
    [overrides]
  );

  const groups = useMemo(() => {
    const g: Record<string, EmailTemplateDef[]> = { drip: [], transactional: [] };
    for (const def of EMAIL_TEMPLATES) (g[def.group] ||= []).push(def);
    return g;
  }, []);

  const editingDef = editingSlug ? EMAIL_TEMPLATES.find((d) => d.slug === editingSlug) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <aside className="relative w-full max-w-lg bg-[var(--paper)] border-l border-[var(--rule)] h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--paper)] border-b border-[var(--rule)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-sans uppercase tracking-wider text-[var(--ink-faint)]">
            Email templates
          </h2>
          <button onClick={onClose} className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-2xl leading-none">
            ×
          </button>
        </div>

        {editingDef ? (
          <Editor
            def={editingDef}
            override={overrideBySlug.get(editingDef.slug)}
            onClose={() => setEditingSlug(null)}
            onToast={onToast}
          />
        ) : (
          <div className="px-6 py-5 space-y-8">
            <p className="font-sans text-sm text-[var(--ink-light)]">
              Every automated email the site sends. Tap one to view and edit its wording — the
              person&apos;s details fill in automatically.
            </p>
            {(["drip", "transactional"] as const).map((group) => (
              <section key={group}>
                <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--ink-faint)] mb-3">
                  {GROUP_LABEL[group]}
                </p>
                <ul className="divide-y divide-[var(--rule)] border-t border-[var(--rule)]">
                  {groups[group].map((def) => {
                    const customized = overrideBySlug.has(def.slug);
                    return (
                      <li key={def.slug}>
                        <button
                          onClick={() => setEditingSlug(def.slug)}
                          className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-white/50"
                        >
                          <span className="min-w-0">
                            <span className="block text-[var(--ink)]">{def.label}</span>
                            <span className="block font-sans text-xs text-[var(--ink-faint)]">
                              {def.timing}
                            </span>
                          </span>
                          <span className="shrink-0 flex items-center gap-2">
                            {customized && (
                              <span className="px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider border border-[var(--accent)] text-[var(--accent)]">
                                Edited
                              </span>
                            )}
                            <span className="text-[var(--ink-faint)]">›</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
