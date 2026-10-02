"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Accessible modal on top of <dialog>: focus trap, Esc to close, backdrop click closes. Bottom sheet on phones. */
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
      className={`m-0 mt-auto w-full max-w-none rounded-t-2xl bg-card p-0 text-text shadow-[var(--shadow-pop)] backdrop:bg-black/60 sm:m-auto sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
    >
      {open && (
        <div className="max-h-[88dvh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="text-xl font-extrabold leading-tight">{title}</h2>
            <button type="button" onClick={onClose} className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full hover:bg-paper" aria-label="Close">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
