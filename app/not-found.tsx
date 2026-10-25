import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">That page is out.</h1>
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
