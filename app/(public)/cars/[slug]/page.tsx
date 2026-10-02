import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CarDetailView } from "@/components/cars/CarDetailView";
import { getPublicCarBySlug, getPublicCars } from "@/lib/cars";
import { getLenders } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { formatInr, formatKm, formatLakh, ordinal } from "@/lib/format";
import { priceBreakup } from "@/lib/price";

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const car = await getPublicCarBySlug(slug);
  if (!car) return { title: "Car not found" };
  const total = priceBreakup(car.priceInr, car.tcsApplicable).total;
  const bits = [car.kmDriven ? formatKm(car.kmDriven) : null, car.fuel, car.transmission, car.owners ? `${ordinal(car.owners)} owner` : null, car.rto ? `${car.rto} registered` : null].filter(Boolean);
  const description = `${car.title} for ${formatLakh(car.priceInr)} (fixed price, RC transfer included${total !== car.priceInr ? `, ${formatInr(total)} incl. TCS` : ""}). ${bits.join(" · ")}. At EliteCarz, Naraina, New Delhi.`;
  return {
    title: `${car.title} — ${formatLakh(car.priceInr)}${car.status === "sold" ? " (sold)" : ""}`,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title: `${car.title} · ${formatLakh(car.priceInr)}`, description, images: car.heroImage ? [{ url: car.heroImage, alt: car.title }] : undefined, type: "website" },
  };
}

export default async function CarPage({ params }: PageProps<"/cars/[slug]">) {
  const { slug } = await params;
  const car = await getPublicCarBySlug(slug);
  if (!car) {
    // Deleted/renamed cars keep their links working via the redirects table.
    const r = await db.redirect.findUnique({ where: { fromPath: `/cars/${slug}` } });
    if (r) permanentRedirect(r.toPath);
    notFound();
  }
  const [all, settings, lenders] = await Promise.all([getPublicCars(), getPublicSettings(), getLenders()]);
  return <CarDetailView car={car} all={all} settings={settings} lenders={lenders} />;
}
