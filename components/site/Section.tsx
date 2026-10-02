import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  href,
  hrefLabel,
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="text-[1.6rem] font-extrabold leading-[1.1] md:text-[2.1rem]">
          {title}
        </h2>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red hover:underline">
          {hrefLabel ?? "See all"} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {it.path ? (
              <Link href={it.path} className="hover:text-text hover:underline">{it.name}</Link>
            ) : (
              <span aria-current="page" className="text-text">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
