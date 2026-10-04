import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Section";
import { ReviewCard } from "@/components/site/ReviewCard";
import { getReviews } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "EliteCarz has a 4.7 review on Google. Read what buyers and sellers say.",
  alternates: { canonical: "/reviews" },
};

const THEMES = [
  ["Transparent dealing", 3],
  ["Initial inspection", 2],
  ["Prompt query resolution", 2],
  ["Car collection", 2],
] as const;

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([getReviews(), getPublicSettings()]);
  const b = settings.business;
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Reviews" }]} />
      <div className="mt-4 grid gap-8 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Reviews</p>
          <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.05]">What customers say</h1>
          <div className="card mt-6 p-6">
            <p className="num font-display text-5xl font-extrabold">{b.googleRating}</p>
            <p className="mt-1 flex gap-0.5" aria-label={`${b.googleRating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`size-5 ${i <= Math.round(b.googleRating) ? "fill-amber-400 text-amber-400" : "text-line-strong"}`} aria-hidden />
              ))}
            </p>
            <p className="mt-2 text-sm text-muted">4.7 review on Google</p>
            <a href={b.googleProfileUrl} target="_blank" rel="noopener" className="btn btn-outline mt-4 w-full">Read all on Google</a>
          </div>
          <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-muted">Mentioned most</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {THEMES.map(([t, n]) => (
              <li key={t} className="chip">
                {t} <span className="num text-muted">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          <p className="text-sm text-muted">
            We only show real reviews. These are short paraphrases of public Google reviews; full quotes and names will be shown once each reviewer agrees. A live Google feed can replace this list.
          </p>
        </div>
      </div>
    </div>
  );
}
