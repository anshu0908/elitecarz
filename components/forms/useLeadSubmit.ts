"use client";
import { useState } from "react";
import { readUtm, track } from "@/lib/client/analytics";

export type SubmitState<R> =
  | { status: "idle" | "submitting" }
  | { status: "success"; result: R }
  | { status: "error"; error: string; fields?: Record<string, string> };

/** Posts to /api/leads with page URL, UTM, honeypot and Turnstile token attached. */
export function useLeadSubmit<R = { id: string }>(form: string) {
  const [state, setState] = useState<SubmitState<R>>({ status: "idle" });

  async function submit(payload: Record<string, unknown>, formEl?: HTMLFormElement | null) {
    setState({ status: "submitting" });
    const fd = formEl ? new FormData(formEl) : null;
    const body = {
      ...payload,
      pageUrl: location.pathname,
      utm: readUtm(),
      hp: (fd?.get("company_website") as string | null) ?? "",
      turnstileToken: (fd?.get("cf-turnstile-response") as string | null) ?? undefined,
    };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", error: data.error ?? "Something went wrong", fields: data.fields });
        return null;
      }
      track("form_submit", { form, lead_type: String(payload.type), car_id: payload.carId as string | undefined });
      setState({ status: "success", result: data as R });
      return data as R;
    } catch {
      setState({ status: "error", error: "Network problem — check your connection, or WhatsApp us instead." });
      return null;
    }
  }

  const fieldError = (name: string) => (state.status === "error" ? state.fields?.[name] : undefined);
  return { state, submit, fieldError, reset: () => setState({ status: "idle" }) };
}
