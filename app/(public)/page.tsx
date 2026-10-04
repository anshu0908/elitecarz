import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, FileCheck2, IndianRupee, KeyRound, MapPin, ShieldCheck, Star } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { CarFinder } from "@/components/site/CarFinder";
import { SectionHeading } from "@/components/site/Section";
import { JsonLd } from "@/components/site/JsonLd";
import { EmiCalculator } from "@/components/cars/EmiCalculator";
import { SellMiniForm } from "@/components/forms/SellMiniForm";
import { ReviewCard } from "@/components/site/ReviewCard";
import { FaqList } from "@/components/site/FaqList";
import { getPublicCarBySlug, getPublicCars } from "@/lib/cars";
import { getFaqs, getReviews } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";
import { transmissionGroup } from "@/lib/filters";
import { formatInr } from "@/lib/format";
import { priceBreakup } from "@/lib/price";
import { faqJsonLd, websiteJsonLd } from "@/lib/seo";
import { INSPECTION_POINT_COUNT } from "@/lib/inspection";

export default async function HomePage() {
  const [cars, settings, faqs, reviews] = await Promise.all([getPublicCars(), getPublicSettings(), getFaqs(), getReviews()]);
  const b = settings.business;
  const available = cars.filter((c) => c.status !== "sold");
  const justArrived = available.slice(0, 8);
  const under10 = available.filter((c) => c.priceInr <= 10_00_000).sort((a, b) => a.priceInr - b.priceInr);
  const autoSuvs = available.filter((c) => (c.bodyType === "SUV" || c.bodyType === "Compact SUV") && transmissionGroup(c.transmission) === "Automatic");
  const sold = cars.filter((c) => c.status === "sold");
  const hector = cars.find((c) => c.slug.includes("hector")) ?? available[0];
  const hectorDetail = hector ? await getPublicCarBySlug(hector.slug) : null;
  const heroImage = hectorDetail?.images[1]?.url ?? hector?.heroImage;
  const hectorBreakup = hector ? priceBreakup(hector.priceInr, hector.tcsApplicable) : null;

  const bodyCounts = countBy(available, (c) => c.bodyType ?? "Other");
  const makeCounts = countBy(available, (c) => c.make);

  return (
    <>
      {/* HERO */}
      <section className="dark-surface relative isolate overflow-hidden bg-ink text-white">
        {heroImage && (
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[70%_60%] opacity-55" />
        )}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0c0c0d_0%,rgba(12,12,13,0.92)_38%,rgba(12,12,13,0.35)_100%)]" />
        <div className="container-x pb-10 pt-10 md:pb-16 md:pt-24">
          <p className="eyebrow animate-fade-up">Naraina · New Delhi</p>
          <h1 className="mt-3 max-w-3xl text-[2.05rem] font-extrabold leading-[1.02] sm:text-[2.6rem] md:text-[3.9rem] animate-fade-up delay-100">
            One fixed price.
            <br />
            Every claim backed on the page.
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] text-white/80 animate-fade-up delay-200">
            Hand-picked pre-owned cars, RC transfer included in the price. Come and see them at our Naraina showroom, open 11 am to 7 pm every day.
          </p>
          <div className="mt-8 max-w-5xl animate-fade-up delay-300">
            <CarFinder cars={cars.map(({ id, make, bodyType, transmission, priceInr, status, publishedAt }) => ({ id, make, bodyType, transmission, priceInr, status, publishedAt }))} />
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-white/75 animate-fade-up delay-400">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            <a href={b.googleProfileUrl} target="_blank" rel="noopener" className="underline-offset-2 hover:underline">
              <strong className="text-white">4.7</strong> review on Google
            </a>
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section aria-label="Why buyers trust EliteCarz" className="border-b border-line bg-card">
        <ul className="container-x grid grid-cols-2 gap-x-4 gap-y-4 py-5 text-sm md:grid-cols-5">
          {[
            { icon: IndianRupee, title: "Fixed price", text: "No haggling, full breakup" },
            { icon: FileCheck2, title: "RC transfer included", text: "Paperwork handled" },
            { icon: ClipboardCheck, title: "Inspection report", text: `${INSPECTION_POINT_COUNT}-point format, per car` },
            { icon: ShieldCheck, title: "Warranty listed", text: "Terms shown on each car" },
            { icon: Star, title: "4.7★ review", text: "On Google" },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-red" aria-hidden />
              <span>
                <strong className="block font-semibold">{title}</strong>
                <span className="text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-x space-y-16 py-14 md:space-y-20 md:py-20">
        <Rail id="just-arrived" eyebrow="Just arrived" title="Fresh on the lot" href="/cars?sort=newest" cars={justArrived} finance={settings.finance} priorityFirst />
        <Rail id="under-10" eyebrow="Budget" title="Under ₹10 lakh" href="/used-cars/under-10-lakh" cars={under10} finance={settings.finance} />
        <Rail id="auto-suv" eyebrow="Most asked for" title="Automatic SUVs" href="/cars?body=SUV,Compact%20SUV&trans=Automatic" cars={autoSuvs} finance={settings.finance} />

        {/* SHOP BY */}
        <section aria-labelledby="shop-by" className="scroll-reveal cv-auto">
          <SectionHeading id="shop-by" eyebrow="Browse" title="Shop by type or brand" />
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="grid grid-cols-2 gap-3">
              {Object.entries(bodyCounts).map(([body, n]) => (
                <li key={body}>
                  <Link href={`/cars?body=${encodeURIComponent(body)}`} className="card card-smooth flex items-center justify-between p-4 font-semibold transition hover:border-ink">
                    {body}
                    <span className="num text-sm text-muted">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap content-start gap-2">
              {Object.entries(makeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([make, n]) => (
                  <li key={make}>
                    <Link href={`/used-cars/${make.toLowerCase().replace(/\s+/g, "-")}`} className="card-smooth inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-4 py-2 text-sm font-semibold transition hover:border-ink">
                      {make} <span className="num text-muted">{n}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section aria-labelledby="how" className="dark-surface scroll-reveal cv-auto -mx-4 rounded-none bg-ink px-4 py-12 text-white md:mx-0 md:rounded-3xl md:px-10">
          <SectionHeading id="how" eyebrow="How buying works" title="Four steps, no surprises" />
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              { icon: BadgeCheck, t: "Pick a car", d: "Every listing shows the full price, inspection report and documents status." },
              { icon: KeyRound, t: "Test drive or reserve", d: "Book a slot, or hold the car with a refundable token while you decide." },
              { icon: FileCheck2, t: "Paperwork", d: "We handle RC transfer and help arrange a loan if you need one." },
              { icon: MapPin, t: "Drive home", d: "Collect from Naraina, or ask about delivery across Delhi NCR." },
            ].map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="border-t border-ink-line pt-4">
                <p className="num font-display text-sm font-bold text-red-on-dark">0{i + 1}</p>
                <Icon className="mt-3 size-6 text-white" aria-hidden />
                <h3 className="mt-3 text-lg font-bold" style={{ fontStretch: "100%" }}>{t}</h3>
                <p className="mt-1 text-sm text-white/70">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* PROOF */}
        {hector && hectorBreakup && (
          <section aria-labelledby="proof" className="scroll-reveal cv-auto">
            <SectionHeading
              id="proof"
              eyebrow="Proof, not slogans"
              title="What “fixed price” and “inspected” actually look like"
              intro={<>Taken from a real listing — the {hector.title}.</>}
            />
            <div className="grid gap-5 md:grid-cols-3">
              <div className="card card-smooth p-5">
                <h3 className="font-bold" style={{ fontStretch: "100%" }}>The price breakup</h3>
                <dl className="num mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Car price</dt><dd className="font-semibold">{formatInr(hectorBreakup.carPrice)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">RC transfer</dt><dd className="font-semibold text-ok">Included</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">TCS (1%)</dt><dd className="font-semibold">{formatInr(hectorBreakup.tcs)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-bold">You pay</dt><dd className="font-bold">{formatInr(hectorBreakup.total)}</dd></div>
                </dl>
              </div>
              <div className="card card-smooth p-5">
                <h3 className="font-bold" style={{ fontStretch: "100%" }}>The inspection report</h3>
                <p className="mt-2 text-sm text-muted">Every section, every item, marked pass, minor or fail — with notes on anything that isn&apos;t perfect.</p>
                <Link href={`/cars/${hector.slug}#inspection`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red hover:underline">
                  See the sample report <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="card card-smooth p-5">
                <h3 className="font-bold" style={{ fontStretch: "100%" }}>Known issues, disclosed</h3>
                <p className="mt-2 text-sm text-muted">If a car has a scuff, a worn tyre or a repaint, it&apos;s written on the listing before you visit — not discovered at the showroom.</p>
                <Link href={`/cars/${hector.slug}#disclosures`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red hover:underline">
                  See an example <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* SELL + FINANCE */}
        <section className="scroll-reveal cv-auto grid gap-6 lg:grid-cols-2" aria-label="Sell your car and finance">
          <div className="card card-smooth p-6 md:p-8">
            <p className="eyebrow">Sell or exchange</p>
            <h2 className="mt-2 text-[1.6rem] font-extrabold leading-tight">What&apos;s your car worth?</h2>
            <p className="mt-2 text-muted">Start with your registration number and phone. You&apos;ll get an indicative range in a minute, then a firm offer after a free inspection.</p>
            <SellMiniForm />
          </div>
          <div className="card card-smooth p-6 md:p-8">
            <p className="eyebrow">Finance</p>
            <h2 className="mt-2 text-[1.6rem] font-extrabold leading-tight">Work out your EMI</h2>
            <p className="mb-5 mt-2 text-muted">Same calculator as on every car page. Change any number and see exactly how it&apos;s worked out.</p>
            <EmiCalculator price={hector?.priceInr ?? 10_00_000} finance={settings.finance} priceEditable compact />
          </div>
        </section>

        {/* REVIEWS */}
        <section aria-labelledby="reviews" className="scroll-reveal cv-auto">
          <SectionHeading
            id="reviews"
            eyebrow="Reviews"
            title="4.7★ review on Google"
            intro="What customers mention most: transparent dealing, a careful initial inspection, and quick answers."
            href="/reviews"
            hrefLabel="All reviews"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>

        {sold.length > 0 && <Rail id="sold" eyebrow="Recently sold" title="Gone to new homes" cars={sold} finance={settings.finance} />}

        {/* SHOWROOM */}
        <section aria-labelledby="visit" className="scroll-reveal cv-auto grid gap-6 overflow-hidden rounded-3xl border border-line bg-card md:grid-cols-2">
          <div className="p-6 md:p-10">
            <p className="eyebrow">Visit</p>
            <h2 id="visit" className="mt-2 text-[1.6rem] font-extrabold leading-tight">The showroom on Ring Road, Naraina</h2>
            <address className="mt-4 not-italic text-muted">
              {b.addressLines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              {b.locality}, {b.city} {b.postalCode}
            </address>
            <p className="mt-3 font-semibold">Open every day, 11 am – 7 pm</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={b.mapsUrl} target="_blank" rel="noopener" className="btn btn-dark">
                <MapPin className="size-[18px]" aria-hidden /> Get directions
              </a>
              <Link href="/contact" className="btn btn-outline">Book a visit</Link>
            </div>
          </div>
          <iframe
            title="EliteCarz showroom on Google Maps"
            src={`https://www.google.com/maps?q=${b.geo.lat},${b.geo.lng}&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0 md:h-full md:min-h-[340px]"
          />
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="scroll-reveal cv-auto mx-auto max-w-3xl">
          <SectionHeading id="faq" eyebrow="Questions" title="Straight answers" />
          <FaqList faqs={faqs.slice(0, 6)} />
          <div className="mt-6 text-center">
            <Link href="/faq" className="btn btn-outline text-sm font-semibold">View all questions & answers →</Link>
          </div>
        </section>
      </div>

      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(faqs.slice(0, 6))} />
    </>
  );
}

function Rail({
  id,
  eyebrow,
  title,
  href,
  cars,
  finance,
  priorityFirst = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  href?: string;
  cars: Awaited<ReturnType<typeof getPublicCars>>;
  finance: Awaited<ReturnType<typeof getPublicSettings>>["finance"];
  priorityFirst?: boolean;
}) {
  if (!cars.length) return null;
  return (
    <section aria-labelledby={id} className="scroll-reveal cv-auto">
      <SectionHeading id={id} eyebrow={eyebrow} title={title} href={href} hrefLabel={`See all ${cars.length}`} />
      <div className="scroll-rail -mx-4 px-4 md:mx-0 md:px-0" tabIndex={0} aria-label={`${title} — scroll for more`}>
        {cars.slice(0, 8).map((c, i) => (
          <CarCard key={c.id} car={c} finance={finance} priority={priorityFirst && i === 0} />
        ))}
      </div>
    </section>
  );
}

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, it) => {
    const k = key(it);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}
