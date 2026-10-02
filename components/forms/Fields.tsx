"use client";
import Link from "next/link";
import { useId } from "react";
import { AlertCircle } from "lucide-react";
import { Turnstile } from "@/components/forms/Turnstile";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, id, className = "", ...rest }: InputProps) {
  const auto = useId();
  const fid = id ?? auto;
  const describedBy = [error ? `${fid}-err` : null, hint ? `${fid}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label}
        {rest.required && <span aria-hidden className="text-red"> *</span>}
      </label>
      <input id={fid} className="field" aria-invalid={!!error} aria-describedby={describedBy} {...rest} />
      {hint && !error && <p id={`${fid}-hint`} className="hint">{hint}</p>}
      {error && <p id={`${fid}-err`} className="error-text">{error}</p>}
    </div>
  );
}

export function PhoneField(props: Omit<InputProps, "type">) {
  return <TextField type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98xxxxxxxx" hint="10-digit mobile number" {...props} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: (string | { value: string; label: string })[]; placeholder?: string };

export function SelectField({ label, error, options, placeholder, id, className = "", ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label}
        {rest.required && <span aria-hidden className="text-red"> *</span>}
      </label>
      <select id={fid} className="field" aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          );
        })}
      </select>
      {error && <p id={`${fid}-err`} className="error-text">{error}</p>}
    </div>
  );
}

export function ConsentField({ error, checked, onChange }: { error?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-red)]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <span>
          EliteCarz may call or WhatsApp me about this request. See the{" "}
          <Link href="/policies/privacy-policy" className="underline" target="_blank">privacy policy</Link>.
        </span>
      </label>
      {error && <p id={`${id}-err`} className="error-text">{error}</p>}
    </div>
  );
}

/** Honeypot + Turnstile. Bots fill the hidden field; humans never see it. */
export function BotGuards() {
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Turnstile />
    </>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-soft px-3 py-2.5 text-sm text-bad">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {message}
    </p>
  );
}
