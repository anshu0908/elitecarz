import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InventoryView } from "@/components/cars/InventoryView";
import { Breadcrumbs } from "@/components/site/Section";
import { JsonLd } from "@/components/site/JsonLd";
import { getPublicCars } from "@/lib/cars";
import { getPublicSettings } from "@/lib/settings";
import { findSegment, segmentFilters } from "@/lib/segments";
import { breadcrumbJsonLd } from "@/lib/seo";

async function load(slug: string) {
  const cars = await getPublicCars();
  const seg = findSegment(slug, [...new Set(cars.map((c) => c.make))]);
  return { cars, seg };
}

export async function generateMetadata({ params }: PageProps<"/used-cars/[segment]">): Promise<Metadata> {
  const { seg } = await load((await params).segment);
  if (!seg) return { title: "Not found" };
  return { title: seg.title, description: seg.description, alternates: { canonical: `/used-cars/${seg.slug}` } };
}

export default async function SegmentPage({ params }: PageProps<"/used-cars/[segment]">) {
  const { cars, seg } = await load((await params).segment);
  if (!seg) notFound();
  const settings = await getPublicSettings();
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Buy a car", path: "/cars" }, { name: seg.h1 }]} />
      <h1 className="mt-3 text-[2rem] font-extrabold leading-tight md:text-[2.6rem]">{seg.h1}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted">{seg.intro}</p>
      <InventoryView cars={cars} initial={segmentFilters(seg)} finance={settings.finance} booking={settings.booking} syncUrl={false} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Buy a car", path: "/cars" }, { name: seg.h1, path: `/used-cars/${seg.slug}` }])} />
    </div>
  );
}
