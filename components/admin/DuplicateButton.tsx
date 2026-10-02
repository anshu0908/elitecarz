"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Copy } from "lucide-react";
import { duplicateCarAction } from "@/app/admin/(panel)/cars/actions";
import { toast } from "@/components/admin/Toast";

export function DuplicateButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await duplicateCarAction(id);
          if (!res.ok) return toast(res.error, { tone: "error" });
          toast("Duplicated as a draft");
          router.push(`/admin/cars/${res.id}`);
        })
      }
    >
      <Copy className="size-4" aria-hidden /> Duplicate
    </button>
  );
}
