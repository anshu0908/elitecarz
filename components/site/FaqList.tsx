import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqList({ faqs }: { faqs: { id: number; question: string; answer: string; category?: string | null }[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card shadow-sm">
      {faqs.map((f, i) => (
        <details key={f.id} className="group px-5 transition-colors group-open:bg-paper/30 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-text hover:text-red transition-colors">
            <span className="flex items-center gap-2.5">
              <HelpCircle className="size-4 shrink-0 text-red/70 group-open:text-red" aria-hidden />
              <span>{f.question}</span>
            </span>
            <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <div className="pb-5 pl-6 pr-2 leading-relaxed text-muted text-sm border-t border-line/40 pt-2.5">
            <p>{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

