"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Free-text input with styled suggestions (WAI-ARIA combobox + listbox), replacing
 * native <datalist>. Typing filters; Up/Down/Enter pick a suggestion; any other text is
 * still allowed (e.g. a model that isn't in the list yet).
 */
export function Autocomplete({
  value,
  onChange,
  suggestions,
  id,
  placeholder,
  invalid,
  describedBy,
  className = "field",
  inputClassName = "",
  autoComplete = "off",
  "aria-label": ariaLabel,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
  "aria-label"?: string;
  style?: React.CSSProperties;
}) {
  const auto = useId();
  const listId = `${auto}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [host, setHost] = useState<Element | null>(null);

  const q = value.trim().toLowerCase();
  const matches = (q ? suggestions.filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q) : suggestions).slice(0, 50);
  const show = open && matches.length > 0;

  const place = useCallback(() => {
    const r = inputRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (!show) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!listRef.current?.contains(t) && t !== inputRef.current) setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (!listRef.current?.contains(e.target as Node)) place();
    };
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [show, place]);

  useEffect(() => {
    if (show && active >= 0) listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [show, active]);

  const openList = () => {
    setHost(inputRef.current?.closest("dialog[open]") ?? document.body);
    place();
    setOpen(true);
  };
  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
    setActive(-1);
  };

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={show ? listId : undefined}
        aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        style={style}
        className={`${className} ${inputClassName}`}
        onFocus={openList}
        onClick={openList}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(-1);
          if (!open) openList();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) openList();
            setActive((a) => Math.min(matches.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && show && active >= 0) {
            e.preventDefault();
            pick(matches[active]);
          } else if (e.key === "Escape" && show) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          } else if (e.key === "Tab") {
            setOpen(false);
          }
        }}
      />
      {show &&
        pos &&
        host &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }}
            className="z-[80] max-h-64 animate-toast-in overflow-y-auto overscroll-contain rounded-xl border border-line bg-card p-1 text-sm text-text shadow-[var(--shadow-pop)]"
          >
            {matches.map((s, i) => (
              <li
                key={s}
                id={`${listId}-${i}`}
                data-i={i}
                role="option"
                aria-selected={i === active}
                onPointerMove={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()} // keep focus in the input
                onClick={() => pick(s)}
                className={`flex min-h-10 cursor-pointer items-center rounded-lg px-3 py-2 ${i === active ? "bg-paper" : ""}`}
              >
                <Highlight text={s} q={q} />
              </li>
            ))}
          </ul>,
          host,
        )}
    </>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <span>
      {text.slice(0, i)}
      <strong className="font-bold text-red">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </span>
  );
}
