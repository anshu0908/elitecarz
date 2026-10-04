"use client";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Turnstile } from "@/components/forms/Turnstile";
import { login, type LoginState } from "./actions";

const DEMO_ROLES = [
  {
    role: "Owner",
    email: "owner@elitecarz.demo",
    tag: "All Access",
    icon: ShieldCheck,
    accent: "text-amber-400",
    activeClass: "border-amber-400/80 bg-amber-500/15 text-white ring-1 ring-amber-400/40",
  },
  {
    role: "Manager",
    email: "manager@elitecarz.demo",
    tag: "Operations",
    icon: Briefcase,
    accent: "text-blue-400",
    activeClass: "border-blue-400/80 bg-blue-500/15 text-white ring-1 ring-blue-400/40",
  },
  {
    role: "Sales",
    email: "sales@elitecarz.demo",
    tag: "Leads & CRM",
    icon: Users,
    accent: "text-emerald-400",
    activeClass: "border-emerald-400/80 bg-emerald-500/15 text-white ring-1 ring-emerald-400/40",
  },
  {
    role: "Viewer",
    email: "viewer@elitecarz.demo",
    tag: "Read-only",
    icon: Eye,
    accent: "text-purple-400",
    activeClass: "border-purple-400/80 bg-purple-500/15 text-white ring-1 ring-purple-400/40",
  },
] as const;

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [email, setEmail] = useState(state.email || "owner@elitecarz.demo");
  const [password, setPassword] = useState("EliteCarz@2026");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-5 space-y-4 text-left">
      <input type="hidden" name="next" value={next} />

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
          Email address <span className="text-red">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@elitecarz.com"
            className="w-full rounded-xl border border-white/15 bg-black/50 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 shadow-inner transition focus:border-red focus:outline-none focus:ring-1 focus:ring-red"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
          Password <span className="text-red">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 shadow-inner transition focus:border-red focus:outline-none focus:ring-1 focus:ring-red"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Turnstile />

      {/* Error Banner */}
      {state.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red/40 bg-red/10 p-3 text-xs text-red-200">
          <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Quick-Fill Demo Roles */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
            <Sparkles className="size-3.5 text-amber-400" />
            Quick-Fill Demo Role
          </span>
          <span className="rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
            1-Click Fill
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {DEMO_ROLES.map(({ role, email: roleEmail, tag, icon: Icon, accent, activeClass }) => {
            const isSelected = email === roleEmail;
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setEmail(roleEmail);
                  setPassword("EliteCarz@2026");
                }}
                className={`flex items-start gap-2 rounded-lg border p-2 text-left transition ${
                  isSelected
                    ? activeClass
                    : "border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className={`size-3.5 shrink-0 mt-0.5 ${accent}`} />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold leading-tight">{role}</div>
                  <div className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">{tag}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="relative w-full rounded-xl bg-red py-3 text-sm font-semibold text-white shadow-lg shadow-red/25 transition-all duration-150 hover:bg-red-dark hover:shadow-red/40 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            <span>Sign in to Admin</span>
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-zinc-400">
        Demo credentials pre-filled for instant reviewer access.
      </p>
    </form>
  );
}
