"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

export type DropdownOption = { value: string; label: string; disabled?: boolean; hint?: string };
type Variant = "field" | "compact" | "ghost" | "finder";

/**
 * Accessible custom select (WAI-ARIA listbox pattern) that replaces native <select>:
 * Up/Down/Home/End to move, Enter (or Space) to choose, Esc/Tab to close, type to jump.
 * Long lists (more than 12 options) get a search box. The list renders in a portal
 * (inside an open <dialog> when there is one) with fixed positioning, so it is never
 * clipped by scroll containers, tables or modals.
 */
export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  variant = "field",
  label,
  id,
  disabled,
  invalid,
  describedBy,
  searchable,
  className = "",
  buttonClassName = "",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  variant?: Variant;
  /** Small caption rendered inside the button (used by the hero finder). */
  label?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Defaults to true when there are more than 12 options. */
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const auto = useId();
  const buttonId = id ?? `${auto}-btn`;
  const listId = `${auto}-list`;
  const opts: DropdownOption[] = useMemo(() => options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)), [options]);
  const selected = opts.find((o) => o.value === value);
  const canSearch = searchable ?? opts.length > 12;

  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1); // index into `visible`
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxH: number; up: boolean } | null>(null);
  const [host, setHost] = useState<Element | null>(null);
  const typed = useRef({ text: "", t: 0 });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [opts, query]);

  const place = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const vh = window.innerHeight;
    const below = vh - b.bottom - 12;
    const above = b.top - 12;
    const up = below < 240 && above > below;
    const maxH = Math.min(340, Math.max(170, up ? above : below));
    const width = Math.min(Math.max(b.width, 220), window.innerWidth - 16);
    const left = Math.min(Math.max(8, b.left), window.innerWidth - width - 8);
    setPos({ top: up ? b.top - 6 : b.bottom + 6, left, width, maxH, up });
  }, []);

  const firstEnabled = (list: DropdownOption[]) => list.findIndex((o) => !o.disabled);

  const openList = () => {
    if (disabled) return;
    setHost(btnRef.current?.closest("dialog[open]") ?? document.body);
    setQuery("");
    const idx = opts.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : firstEnabled(opts));
    place();
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) btnRef.current?.focus();
  };
  const choose = (i: number) => {
    const o = visible[i];
    if (!o || o.disabled) return;
    if (o.value !== value) onChange(o.value);
    close();
  };
  const move = (from: number, dir: 1 | -1) => {
    const n = visible.length;
    for (let i = from + dir, k = 0; k < n; i += dir, k++) {
      const j = (i + n) % n;
      if (!visible[j].disabled) return j;
    }
    return from;
  };

  useLayoutEffect(() => {
    if (!open) return;
    (canSearch ? searchRef.current : listRef.current)?.focus({ preventScroll: true });
  }, [open, canSearch]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) close(false);
    };
    const onScroll = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return;
      place();
    };
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, place]);

  const onKey = (e: React.KeyboardEvent) => {
    const inSearch = e.target === searchRef.current;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => move(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => move(a, -1));
        break;
      case "Home":
        if (inSearch) break;
        e.preventDefault();
        setActive(move(-1, 1));
        break;
      case "End":
        if (inSearch) break;
        e.preventDefault();
        setActive(move(visible.length, -1));
        break;
      case "Enter":
        e.preventDefault();
        choose(active);
        break;
      case " ":
        if (inSearch) break;
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault(); // keeps a surrounding <dialog> open
        e.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (!inSearch && e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          typed.current = { text: (now - typed.current.t < 700 ? typed.current.text : "") + e.key.toLowerCase(), t: now };
          const i = visible.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text));
          if (i >= 0) setActive(i);
        }
    }
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const base: Record<Variant, string> = {
    field: "field flex items-center justify-between gap-2 text-left hover:border-ink",
    compact: "flex min-h-9 items-center justify-between gap-1.5 rounded-lg border border-line-strong bg-card px-3 text-sm font-semibold text-left hover:border-ink",
    ghost: "flex min-h-8 items-center justify-between gap-1 rounded-md border border-line bg-card px-2.5 text-xs font-semibold text-left hover:border-ink",
    finder: "flex w-full flex-col items-stretch rounded-xl bg-paper px-3 pb-1.5 pt-2 text-left hover:bg-[#ecebe6]",
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKey}
        className={`${base[variant]} w-full cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${open ? "ring-2 ring-red" : ""} ${buttonClassName}`}
      >
        {variant === "finder" ? (
          <>
            <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted">{label}</span>
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-[0.95rem] font-semibold">{selected?.label ?? placeholder}</span>
              <Chevron open={open} />
            </span>
          </>
        ) : (
          <>
            <span className={`truncate ${selected?.value ? "" : "text-muted"}`}>{selected?.label ?? placeholder}</span>
            <Chevron open={open} />
          </>
        )}
      </button>

      {open &&
        pos &&
        host &&
        createPortal(
          <div
            ref={popRef}
            onKeyDown={onKey}
            style={{ position: "fixed", left: pos.left, width: pos.width, maxHeight: pos.maxH, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
            className="z-[80] flex animate-toast-in flex-col overflow-hidden rounded-xl border border-line bg-card text-sm text-text shadow-[var(--shadow-pop)]"
          >
            {canSearch && (
              <div className="border-b border-line p-1.5">
                <label className="flex items-center gap-2 rounded-lg bg-paper px-2.5">
                  <Search className="size-4 shrink-0 text-muted" aria-hidden />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    placeholder="Type to search…"
                    aria-label="Search options"
                    aria-controls={listId}
                    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                    className="min-h-9 w-full bg-transparent text-sm outline-none"
                  />
                </label>
              </div>
            )}
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={canSearch ? -1 : 0}
              aria-labelledby={ariaLabelledBy ?? buttonId}
              aria-activedescendant={!canSearch && active >= 0 ? `${listId}-${active}` : undefined}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 outline-none"
            >
              {visible.length === 0 && <li className="px-3 py-2.5 text-muted">No matches</li>}
              {visible.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li
                    key={`${o.value}-${i}`}
                    id={`${listId}-${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={isSel}
                    aria-disabled={o.disabled || undefined}
                    onPointerMove={() => !o.disabled && setActive(i)}
                    onClick={() => choose(i)}
                    className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 ${
                      o.disabled ? "cursor-not-allowed text-muted/50" : i === active ? "bg-paper" : ""
                    } ${isSel ? "font-semibold" : ""}`}
                  >
                    <span className="flex-1">
                      {o.label}
                      {o.hint && <span className="block text-xs font-normal text-muted">{o.hint}</span>}
                    </span>
                    {isSel && <Check className="size-4 shrink-0 text-red" aria-hidden />}
                  </li>
                );
              })}
            </ul>
          </div>,
          host,
        )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return <ChevronDown className={`size-4 shrink-0 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden />;
}
