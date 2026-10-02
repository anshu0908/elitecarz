"use client";
import { useId, useState } from "react";
import { Plus, X } from "lucide-react";

/** Tag-style list input with optional one-tap presets (BRIEF §16.4.6). */
export function TagInput({ label, value, onChange, presets = [], placeholder, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; presets?: string[]; placeholder?: string; hint?: string }) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((t) => (
            <li key={t} className="inline-flex items-center gap-1 rounded-full bg-ink py-1 pl-3 pr-1 text-xs font-semibold text-white">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid size-5 place-items-center rounded-full hover:bg-white/20" aria-label={`Remove ${t}`}>
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          className="field"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <button type="button" className="btn btn-outline" onClick={() => add(draft)} aria-label={`Add to ${label}`}>
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
      {presets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.filter((p) => !value.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => add(p)} className="rounded-full border border-dashed border-line-strong px-2.5 py-1 text-xs text-muted hover:border-ink hover:text-text">
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
