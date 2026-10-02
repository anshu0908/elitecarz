import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label="EliteCarz home">
      <Image src="/logo-elitecarz.png" alt="EliteCarz" width={1160} height={192} priority className="h-[20px] w-auto md:h-[24px]" />
    </Link>
  );
}
