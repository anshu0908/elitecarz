import type { Metadata } from "next";
import { CompareView } from "@/components/cars/CompareView";
import { Breadcrumbs } from "@/components/site/Section";
import { getPublicCars } from "@/lib/cars";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Compare cars", description: "Compare up to three EliteCarz cars side by side.", robots: { index: false } };

export default async function ComparePage() {
  const [cars, settings] = await Promise.all([getPublicCars(), getPublicSettings()]);
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Compare" }]} />
      <h1 className="mb-6 mt-3 text-[2rem] font-extrabold">Compare cars</h1>
      <CompareView cars={cars} finance={settings.finance} />
    </div>
  );
}
