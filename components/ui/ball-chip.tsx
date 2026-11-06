import { cn } from "@/lib/utils";

type Kind = "dot" | "run" | "four" | "six" | "wicket" | "extra";

export function ballKind(raw: string): Kind {
  const ball = raw.trim().toUpperCase();
  if (ball === "W" || /^W\d*$/.test(ball) || ball.includes("WKT")) return "wicket";
  if (/^(WD|NB|N|LB|L|B)\d*$/.test(ball)) return "extra";
  if (ball === "0" || ball === "•" || ball === ".") return "dot";
  if (ball === "4") return "four";
  if (ball === "6") return "six";
  return "run";
}

/**
 * Six outcomes, but only two get a fill — a wicket and a six. Everything else
 * is differentiated by rule weight and ink, so a batted-over strip reads as
 * text rather than confetti.
 */
const KIND_STYLE: Record<Kind, string> = {
  dot: "border border-line text-faint",
  run: "border border-line-strong text-ink",
  four: "border border-slab text-accent font-bold",
  six: "bg-slab text-white font-bold",
  wicket: "bg-wkt text-white font-bold",
  extra: "border border-dashed border-line-strong text-muted",
};

export function BallChip({
  ball,
  size = 26,
  className,
}: {
  ball: string;
  size?: number;
  className?: string;
}) {
  const kind = ballKind(ball);
  const label = kind === "dot" ? "•" : ball.length > 3 ? ball.slice(0, 3) : ball;
  return (
    <span
      title={ball}
      className={cn(
        "ball-chip tnum inline-grid shrink-0 place-items-center border-0 leading-none",
        KIND_STYLE[kind],
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: label.length > 2 ? size * 0.34 : size * 0.44,
      }}
    >
      {label}
    </span>
  );
}
