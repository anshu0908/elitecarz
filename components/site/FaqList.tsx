import { ChevronDown } from "lucide-react";

export function FaqList({ faqs }: { faqs: { id: number; question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {faqs.map((f) => (
        <details key={f.id} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
            {f.question}
            <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-5 leading-relaxed text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
