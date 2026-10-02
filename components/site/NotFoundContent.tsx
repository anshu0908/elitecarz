import Link from "next/link";
import { CarCard } from "@/components/cars/CarCard";
import { getPublicCars } from "@/lib/cars";
import { getPublicSettings } from "@/lib/settings";

export async function NotFoundContent() {
  const [cars, settings] = await Promise.all([getPublicCars(), getPublicSettings()]);
  const popular = [...cars].filter((c) => c.status === "published").sort((a, b) => b.views - a.views).slice(0, 4);
  return (
    <div className="container-x py-14">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-[2.2rem] font-extrabold">That page has driven off</h1>
      <p className="mt-2 max-w-lg text-muted">The car may have been sold, or the link is out of date. Search our current stock instead.</p>
      <form action="/cars" className="mt-6 flex max-w-md gap-2">
        <label htmlFor="nf-q" className="sr-only">Search cars</label>
        <input id="nf-q" name="q" className="field" placeholder="e.g. Creta, automatic, diesel" />
        <button className="btn btn-red">Search</button>
      </form>
      <h2 className="mb-4 mt-12 text-xl font-extrabold">Most viewed right now</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {popular.map((c) => (
          <CarCard key={c.id} car={c} finance={settings.finance} />
        ))}
      </div>
      <Link href="/cars" className="btn btn-dark mt-8">See all cars</Link>
    </div>
  );
}
