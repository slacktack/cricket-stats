import { cn } from "@/lib/utils";

export function BlueHero({
  children,
  className,
  tints,
}: {
  children: React.ReactNode;
  className?: string;
  tints?: [string, string];
}) {
  const base = "linear-gradient(135deg, #0a1a4f 0%, #1435a8 55%, #2a5cff 100%)";
  const background = tints
    ? `radial-gradient(70% 90% at 0% 100%, ${tints[0]}40, transparent 60%), radial-gradient(70% 90% at 100% 100%, ${tints[1]}40, transparent 60%), ${base}`
    : base;
  return (
    <div
      className={cn("relative overflow-hidden rounded-3xl text-white", className)}
      style={{ background }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute right-[-120px] top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-[0.08]"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="white" strokeWidth="2" />
        <rect x="188" y="150" width="24" height="100" fill="none" stroke="white" strokeWidth="2" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

export function HeroChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white", className)}>
      {children}
    </span>
  );
}

export function HeroStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white/10 px-4 py-3">
      <p className="tnum font-display text-[28px] font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12px] text-white/70">{label}</p>
    </div>
  );
}
