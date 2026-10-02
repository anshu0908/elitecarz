import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarDetailView } from "@/components/cars/CarDetailView";
import { requirePageUser } from "@/lib/auth";
import { getCarDetailForPreview, getPublicCars } from "@/lib/cars";
import { getLenders } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({ params }: PageProps<"/admin/cars/[id]/preview">) {
  await requirePageUser("cars.view");
  const { id } = await params;
  const car = await getCarDetailForPreview(id);
  if (!car) notFound();
  const [all, settings, lenders] = await Promise.all([getPublicCars(), getPublicSettings(), getLenders()]);
  return (
    <div className="-mx-4 -mt-5 md:-mx-7 md:-mt-7">
      <div className="sticky top-14 z-30 flex items-center gap-3 bg-demo px-4 py-2 text-sm text-white lg:top-0">
        <strong>Preview</strong> — this is how the listing will look. Status: <span className="capitalize">{car.status}</span>
        <Link href={`/admin/cars/${id}`} className="ml-auto rounded-md bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">Back to edit</Link>
      </div>
      <CarDetailView car={car} all={all} settings={settings} lenders={lenders} />
    </div>
  );
}
