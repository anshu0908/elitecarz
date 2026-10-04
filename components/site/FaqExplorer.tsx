"use client";
import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Phone, Search } from "lucide-react";
import type { FaqItem } from "@/lib/content";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export function FaqExplorer({ faqs, phone }: { faqs: FaqItem[]; phone: string }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ["All", ...Array.from(set)];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchCat = activeCategory === "All" || f.category?.toLowerCase() === activeCategory.toLowerCase();
      if (!matchCat) return false;
      if (!q) return true;
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [faqs, activeCategory, query]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions (e.g., RC transfer, test drive, warranty, loan)..."
          className="input h-12 w-full rounded-2xl pl-11 pr-4 text-base shadow-sm focus:border-red"
          aria-label="Search frequently asked questions"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                isSelected
                  ? "bg-ink text-white shadow-sm"
                  : "bg-card text-muted hover:bg-paper hover:text-text border border-line"
              }`}
            >
              {cat}
            </button>
          );
        })}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-xs text-red hover:underline ml-auto"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-muted flex items-center justify-between">
        <span>Showing {filtered.length} {filtered.length === 1 ? "answer" : "answers"}</span>
        {activeCategory !== "All" && <span>Category: <strong>{activeCategory}</strong></span>}
      </div>

      {/* FAQ Accordion List */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-line rounded-2xl border border-line bg-card shadow-sm">
          {filtered.map((f, i) => (
            <details
              key={f.id}
              className="group px-5 [&_summary::-webkit-details-marker]:hidden"
              open={i === 0 && !query && activeCategory === "All"}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-text hover:text-red transition-colors">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="size-4 shrink-0 text-red/70 group-open:text-red" aria-hidden />
                  <span>{f.question}</span>
                </span>
                <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="pb-5 pl-6 pr-2 leading-relaxed text-muted text-sm border-t border-line/50 pt-3">
                <p>{f.answer}</p>
                {f.category && (
                  <span className="mt-3 inline-block rounded bg-paper px-2 py-0.5 text-[11px] font-medium text-muted">
                    Topic: {f.category}
                  </span>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-card">
          <HelpCircle className="mx-auto size-8 text-muted/50 mb-2" aria-hidden />
          <p className="font-semibold">No questions matched &quot;{query}&quot;</p>
          <p className="text-sm text-muted mt-1">Try another search term or browse all categories.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setActiveCategory("All"); }}
            className="btn btn-outline btn-sm mt-4"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Still need help callout */}
      <div className="rounded-2xl border border-line bg-gradient-to-r from-card to-paper p-6 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base">Have a question not answered here?</h3>
            <p className="text-xs text-muted mt-1">Our showroom advisors in Naraina are available 11 AM to 7 PM every day.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={whatsappLink(phone, "Hi EliteCarz team, I had a question about buying/selling a car.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1EBE5D] font-semibold flex items-center gap-1.5"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp Us
            </a>
            <a
              href={telLink(phone)}
              className="btn btn-outline btn-sm font-semibold flex items-center gap-1.5"
            >
              <Phone className="size-4" aria-hidden /> Call Showroom
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
