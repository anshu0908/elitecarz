"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ToastItem = { id: number; message: string; tone?: "ok" | "error"; action?: { label: string; onClick: () => void | Promise<void> } };
type Listener = (t: ToastItem[]) => void;

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(items));

/** Show a toast. Undo-style actions stay up for 8 seconds. */
export function toast(message: string, opts: { tone?: "ok" | "error"; action?: ToastItem["action"]; ms?: number } = {}) {
  const id = ++seq;
  items = [...items, { id, message, tone: opts.tone, action: opts.action }];
  emit();
  setTimeout(() => dismiss(id), opts.ms ?? (opts.action ? 8000 : 3500));
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(() => items);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
      {list.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex w-full max-w-md animate-toast-in items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-[var(--shadow-pop)] ${t.tone === "error" ? "bg-bad" : "bg-ink"}`}>
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="rounded-md bg-white/15 px-3 py-1.5 font-bold hover:bg-white/25"
              onClick={async () => {
                dismiss(t.id);
                await t.action!.onClick();
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid size-7 place-items-center rounded hover:bg-white/10">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
