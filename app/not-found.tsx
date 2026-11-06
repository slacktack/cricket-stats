import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { HeroFolio } from "@/components/ui/blue-hero";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">Error at the crease</p>
      <HeroFolio n="404" className="mt-3 !text-[clamp(84px,18vw,190px)]" />
      <h1 className="display mt-2 text-4xl uppercase tracking-[-0.035em] sm:text-5xl">That page is out.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The match, series or player you are looking for may have moved. Try the live feed or search for it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className={buttonClass({ variant: "primary" })}>Live matches</Link>
        <Link href="/search" className={buttonClass({ variant: "secondary" })}>
          <Search className="h-4 w-4" />
          Search
        </Link>
      </div>
    </div>
  );
}
