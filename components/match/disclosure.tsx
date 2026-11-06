"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A scorecard innings that folds away on a phone and lies flat on a desk.
 * `open` is decided after mount so the server markup stays a plain details.
 */
export function Disclosure({
  summary,
  children,
  className,
  forceOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  forceOpen?: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.open =
      forceOpen || window.matchMedia("(min-width: 1024px)").matches;
  }, [forceOpen]);

  return (
    <details ref={ref} className={cn("disc blk", className)} data-rv="">
      <summary className="disc-head">
        <div className="spread min-w-0 flex-1">{summary}</div>
        <span className="disc-mark" aria-hidden="true">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className="disc-body">{children}</div>
    </details>
  );
}
