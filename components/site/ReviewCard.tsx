import { Quote } from "lucide-react";

type Review = { id: string; author: string; body: string; source: string; isParaphrase: boolean; carLabel: string | null; reviewedOn: string | null };

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="card flex h-full flex-col p-5">
      <Quote className="size-6 text-red" aria-hidden />
      <blockquote className="mt-3 flex-1 text-[1.02rem] leading-relaxed">{review.body}</blockquote>
      <figcaption className="mt-4 border-t border-line pt-3 text-sm">
        <span className="font-semibold">{review.author}</span>
        <span className="text-muted">
          {" "}
          · Google{review.reviewedOn ? `, ${review.reviewedOn}` : ""}
          {review.carLabel ? ` · ${review.carLabel}` : ""}
        </span>
        {review.isParaphrase && (
          <span className="mt-1 block text-xs text-muted">
            Paraphrased from a public Google review. <span className="demo-tag">CONSENT PENDING</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
