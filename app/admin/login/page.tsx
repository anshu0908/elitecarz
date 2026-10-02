import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return (
    <div className="dark-surface grid min-h-dvh place-items-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <Image src="/logo-elitecarz.png" alt="EliteCarz" width={1160} height={192} className="mx-auto h-6 w-auto" priority />
        <div className="mt-8 rounded-2xl bg-card p-6 text-text shadow-[var(--shadow-pop)]">
          <h1 className="text-xl font-extrabold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted">Inventory, leads and settings.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
        <div className="mt-6 rounded-xl border border-ink-line p-4 text-xs text-white/70">
          <p className="font-semibold text-white">Demo accounts <span className="demo-tag">DEMO</span></p>
          <p className="mt-1">owner@ · manager@ · sales@ · viewer@elitecarz.demo</p>
          <p>Password: EliteCarz@2026</p>
        </div>
      </div>
    </div>
  );
}
