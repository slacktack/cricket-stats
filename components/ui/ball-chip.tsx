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

const KIND_STYLE: Record<Kind, string> = {
  dot: "bg-[#3a3a3e] text-[#d4d4d8]",
  run: "bg-[#8a6a10] text-white",
  four: "bg-[#1d5fa8] text-white",
  six: "bg-[#15803d] text-white",
  wicket: "bg-wkt text-white",
  extra: "bg-[#5b4b8a] text-white",
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
        "tnum inline-grid shrink-0 place-items-center rounded-full font-semibold leading-none",
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
