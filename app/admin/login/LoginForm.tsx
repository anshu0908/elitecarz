"use client";
import { useActionState } from "react";
import { FormError, TextField } from "@/components/forms/Fields";
import { Turnstile } from "@/components/forms/Turnstile";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="next" value={next} />
      <TextField label="Email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required minLength={12} />
      <Turnstile />
      <FormError message={state.error} />
      <button type="submit" className="btn btn-red w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-xs text-muted">Forgot your password? Ask the owner to reset it from Users.</p>
    </form>
  );
}
