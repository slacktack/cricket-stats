"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">Feed error</p>
      <h1 className="display mt-4 text-4xl tracking-[-0.035em] sm:text-5xl">The feed went quiet.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        We could not load this page right now. The cricket feed may be briefly unavailable.
      </p>
      <button type="button" onClick={reset} className={buttonClass({ variant: "primary", className: "mt-6" })}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
