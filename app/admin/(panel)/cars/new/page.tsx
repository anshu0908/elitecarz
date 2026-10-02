import type { Metadata } from "next";
import Link from "next/link";
import { CarForm } from "@/components/admin/CarForm";
import { EMPTY_CAR } from "@/lib/admin/car-form-types";
import { requirePageUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { loadMasterData } from "@/lib/admin/car-form-data";

export const metadata: Metadata = { title: "Add car" };

export default async function NewCarPage({ searchParams }: PageProps<"/admin/cars/new">) {
  const user = await requirePageUser("cars.edit");
  const quick = (await searchParams).quick === "1";
  const master = await loadMasterData();
  return (
    <div>
      <Link href="/admin/cars" className="text-sm text-muted hover:text-text">← Cars</Link>
      <h1 className="mb-5 mt-1 text-2xl font-extrabold">{quick ? "Quick add" : "Add a car"}</h1>
      <CarForm carId={null} initial={EMPTY_CAR} master={master} perms={{ publish: can(user.role, "cars.publish"), viewCost: can(user.role, "cars.viewCost") }} quick={quick} />
    </div>
  );
}
