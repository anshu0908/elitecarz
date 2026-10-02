import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Section";
import { getPublicCars } from "@/lib/cars";
import { getTeam } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About EliteCarz & how buying works",
  description: "A single used-car showroom on Ring Road, Naraina. Fixed prices, RC transfer included, and a named person who looks after you.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [team, settings, cars] = await Promise.all([getTeam(), getPublicSettings(), getPublicCars()]);
  const b = settings.business;
  const showroomShot = cars.find((c) => c.slug.includes("hector"))?.images[1]?.url;

  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About" }]} />
      <div className="mt-4 grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.05] md:text-[2.8rem]">One showroom. People you can name.</h1>
          <p className="mt-4 text-muted">
            EliteCarz is a used-car dealer on Ring Road in Naraina, New Delhi. Customers who review us on Google mention the same things again and again: transparent dealing, a careful first inspection, and quick answers when they ask something.
          </p>
          <p className="mt-3 text-muted">
            Every car is sold at one fixed price with RC transfer included. We&apos;d rather tell you about a scuff before you visit than have you find it at the showroom.
          </p>
          <p className="mt-4 text-sm font-semibold">
            {b.googleRating}★ on Google · {b.googleReviewCount} reviews ·{" "}
            <Link href="/reviews" className="text-red hover:underline">read them</Link>
          </p>
        </div>
        {showroomShot && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-3">
            <Image src={showroomShot} alt="The EliteCarz showroom on Ring Road, Naraina" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>

      <section className="mt-16" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-extrabold">How buying works</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["Shortlist online", "Full price breakup, photos, inspection report and documents status on every listing."],
            ["Test drive or reserve", "Book a slot online, or hold the car with a refundable token."],
            ["Paperwork & loan", "We handle RC transfer and can arrange finance through partner lenders."],
            ["Handover", "Collect from Naraina, or ask about delivery across Delhi NCR. We walk you through the car and its documents."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-5">
              <p className="num font-display text-sm font-bold text-red">0{i + 1}</p>
              <h3 className="mt-2 font-bold" style={{ fontStretch: "100%" }}>{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="team">
        <h2 id="team" className="text-2xl font-extrabold">The team</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <li key={m.id} className="card flex gap-4 p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-paper text-muted">
                <UserRound className="size-7" aria-hidden />
              </span>
              <div>
                <p className="font-bold">{m.name}</p>
                <p className="text-sm text-red">{m.role}</p>
                {m.bio && <p className="mt-1 text-sm text-muted">{m.bio}</p>}
              </div>
            </li>
          ))}
          <li className="card grid place-items-center border-dashed p-5 text-center text-sm text-muted">More team profiles once photos and consent are in.</li>
        </ul>
      </section>
    </div>
  );
}
