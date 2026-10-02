import PublicLayout from "@/app/(public)/layout";
import { NotFoundContent } from "@/components/site/NotFoundContent";

// Unmatched URLs render outside the (public) group, so wrap in its layout here.
export default function NotFound() {
  return (
    <PublicLayout>
      <NotFoundContent />
    </PublicLayout>
  );
}
