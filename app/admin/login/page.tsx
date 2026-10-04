import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Staff sign in · EliteCarz",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return (
    <div className="relative min-h-dvh flex flex-col justify-center items-center bg-[#09090b] px-4 py-12 text-white selection:bg-red selection:text-white">
      {/* Luxury ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-red/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="relative w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02] focus-visible:outline-none">
            <Image
              src="/logo-elitecarz.png"
              alt="EliteCarz"
              width={1160}
              height={192}
              className="mx-auto h-7 w-auto drop-shadow-md"
              priority
            />
          </Link>
        </div>

        {/* Glassmorphic Portal Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121215]/95 p-7 shadow-2xl backdrop-blur-2xl">
          {/* Subtle top edge crimson accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red to-transparent opacity-80" />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red/30 bg-red/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-on-dark uppercase">
              <span className="size-1.5 rounded-full bg-red animate-pulse" />
              Staff Portal
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">v2026.1</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white font-display">Staff sign in</h1>
          <p className="mt-1 text-xs text-zinc-400">Sign in to manage showroom inventory, leads & settings.</p>

          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>

        {/* Back to showroom navigation */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to public showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
