import type { Metadata } from "next";
import { ShortlistView } from "@/components/cars/CompareView";
import { Breadcrumbs } from "@/components/site/Section";
import { getPublicCars } from "@/lib/cars";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your shortlist", robots: { index: false } };

export default async function ShortlistPage() {
  const [cars, settings] = await Promise.all([getPublicCars(), getPublicSettings()]);
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Shortlist" }]} />
      <h1 className="mb-6 mt-3 text-[2rem] font-extrabold">Your shortlist</h1>
      <ShortlistView cars={cars} finance={settings.finance} />
    </div>
  );
}
