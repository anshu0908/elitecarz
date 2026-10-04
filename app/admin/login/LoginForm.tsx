"use client";
import { useActionState, useState } from "react";
import { ShieldCheck, User, Users } from "lucide-react";
import { FormError, TextField } from "@/components/forms/Fields";
import { Turnstile } from "@/components/forms/Turnstile";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [email, setEmail] = useState(state.email || "owner@elitecarz.demo");
  const [password, setPassword] = useState("EliteCarz@2026");

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="next" value={next} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        minLength={12}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Turnstile />
      <FormError message={state.error} />

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-amber-300">Quick-Fill Demo Account:</span>
          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-200">Review Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEmail("owner@elitecarz.demo");
              setPassword("EliteCarz@2026");
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
              email === "owner@elitecarz.demo"
                ? "border-amber-400 bg-amber-500/25 text-amber-200"
                : "border-white/10 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white"
            }`}
          >
            <ShieldCheck className="size-3.5 text-amber-400" />
            <span>Owner (All Access)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("manager@elitecarz.demo");
              setPassword("EliteCarz@2026");
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
              email === "manager@elitecarz.demo"
                ? "border-amber-400 bg-amber-500/25 text-amber-200"
                : "border-white/10 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white"
            }`}
          >
            <User className="size-3.5 text-blue-400" />
            <span>Manager</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("sales@elitecarz.demo");
              setPassword("EliteCarz@2026");
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
              email === "sales@elitecarz.demo"
                ? "border-amber-400 bg-amber-500/25 text-amber-200"
                : "border-white/10 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white"
            }`}
          >
            <Users className="size-3.5 text-emerald-400" />
            <span>Sales</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("viewer@elitecarz.demo");
              setPassword("EliteCarz@2026");
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
              email === "viewer@elitecarz.demo"
                ? "border-amber-400 bg-amber-500/25 text-amber-200"
                : "border-white/10 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white"
            }`}
          >
            <User className="size-3.5 text-purple-400" />
            <span>Viewer (Read-only)</span>
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-red w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in to Admin"}
      </button>
      <p className="text-center text-xs text-muted">Demo credentials pre-filled for effortless review.</p>
    </form>
  );
}
