import type { Metadata } from "next";
import { InventoryView } from "@/components/cars/InventoryView";
import { Breadcrumbs } from "@/components/site/Section";
import { JsonLd } from "@/components/site/JsonLd";
import { getPublicCars } from "@/lib/cars";
import { getPublicSettings } from "@/lib/settings";
import { parseFilters } from "@/lib/filters";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Used cars for sale in Delhi — fixed prices",
  description: "Browse every car at EliteCarz, Naraina: filter by budget, body type, brand, fuel and gearbox. Fixed prices with RC transfer included.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage({ searchParams }: PageProps<"/cars">) {
  const [cars, settings, sp] = await Promise.all([getPublicCars(), getPublicSettings(), searchParams]);
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Buy a car" }]} />
      <h1 className="mb-6 mt-3 text-[2rem] font-extrabold leading-tight md:text-[2.6rem]">Used cars in Delhi</h1>
      <InventoryView cars={cars} initial={parseFilters(sp)} finance={settings.finance} booking={settings.booking} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Buy a car", path: "/cars" }])} />
    </div>
  );
}
