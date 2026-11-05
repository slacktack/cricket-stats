"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MatchOvers } from "@/lib/data/overs";
import { cn } from "@/lib/utils";
import { BallChip } from "@/components/ui/ball-chip";

type Mode = "worm" | "manhattan";

const H = 260;
const M = { top: 16, right: 16, bottom: 28, left: 36 };

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const step = value > 200 ? 50 : value > 100 ? 25 : value > 40 ? 10 : value > 16 ? 5 : 2;
  return Math.ceil((value * 1.08) / step) * step;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width)))
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function GameProgress({
  data,
  oversLimit,
  className,
}: {
  data: MatchOvers;
  oversLimit?: number;
  className?: string;
}) {
  const [mode, setMode] = useState<Mode>("worm");
  const [hover, setHover] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const teams = useMemo(() => {
    const order: string[] = [];
    for (const innings of data.innings) {
      if (innings.team && !order.includes(innings.team)) order.push(innings.team);
    }
    return order;
  }, [data.innings]);

  const innings = data.innings.filter((item) => item.overs.length > 0);
  if (innings.length === 0) return null;

  const colorOf = (team: string) =>
    teams.indexOf(team) === 1 ? "rgb(var(--s2))" : "rgb(var(--s1))";
  const lastOver = Math.max(...innings.map((item) => item.overs.at(-1)?.over ?? 0));
  const maxX = Math.max(oversLimit && lastOver <= oversLimit ? oversLimit : lastOver, 5);
  const plotW = width - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const maxY =
    mode === "worm"
      ? niceMax(Math.max(...innings.map((item) => item.overs.at(-1)?.score ?? 0)))
      : niceMax(Math.max(...innings.flatMap((item) => item.overs.map((o) => o.runs))));
  const x = (over: number) => M.left + (over / maxX) * plotW;
  const y = (value: number) => M.top + plotH - (value / maxY) * plotH;
  const ticksY = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxY * f));
  const tickStep = maxX > 60 ? 20 : maxX > 30 ? 10 : maxX > 12 ? 5 : 2;
  const ticksX = Array.from({ length: Math.floor(maxX / tickStep) + 1 }, (_, i) => i * tickStep);
  const band = plotW / maxX;
  const barGap = 2;
  const barW = Math.max(2, (band - 4 - barGap * (innings.length - 1)) / innings.length);

  function onMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const over = Math.ceil((px / rect.width) * maxX);
    setHover(Math.min(maxX, Math.max(1, over)));
  }

  const hoverRows =
    hover === null
      ? []
      : innings
          .map((item) => ({ item, point: item.overs.find((o) => o.over === hover) }))
          .filter((row) => row.point);
  const tooltipLeft = hover === null ? 0 : x(hover - (mode === "manhattan" ? 0.5 : 0));

  return (
    <section className={cn("rounded-xl border border-line bg-surface p-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-[15px] font-semibold">Game progress</h3>
        <div className="flex items-center gap-3 text-[12px] text-muted">
          {teams.map((team) => (
            <span key={team} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(team) }} />
              {team}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-surface" />
            Wicket
          </span>
        </div>
        <div className="ml-auto flex rounded-lg border border-line bg-bg/60 p-0.5 text-[12px]">
          {(["worm", "manhattan"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              aria-pressed={mode === item}
              className={cn(
                "h-7 rounded-md px-3 font-medium capitalize transition-colors",
                mode === item ? "bg-surface2 text-ink" : "text-faint hover:text-ink"
              )}
            >
              {item === "worm" ? "Runs" : "Per over"}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative mt-3">
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`${mode === "worm" ? "Cumulative runs" : "Runs per over"} for ${teams.join(" and ")}`}
          className="block"
        >
          {ticksY.map((tick) => (
            <g key={tick}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="rgb(var(--line))"
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text
                x={M.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-faint text-[11px]"
              >
                {tick}
              </text>
            </g>
          ))}
          {ticksX.map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={H - 8}
              textAnchor="middle"
              className="fill-faint text-[11px]"
            >
              {tick}
            </text>
          ))}

          {hover !== null ? (
            <line
              x1={tooltipLeft}
              x2={tooltipLeft}
              y1={M.top}
              y2={M.top + plotH}
              stroke="rgb(var(--line-strong))"
            />
          ) : null}

          {mode === "worm"
            ? innings.map((item, index) => {
                const color = colorOf(item.team);
                const d = [
                  `M${x(0)},${y(0)}`,
                  ...item.overs.map((o) => `L${x(o.over)},${y(o.score)}`),
                ].join(" ");
                return (
                  <g key={item.inningsId}>
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeDasharray={index >= 2 ? "6 4" : undefined}
                    />
                    {item.overs
                      .filter((o) => o.wicketsInOver > 0)
                      .map((o) => (
                        <circle
                          key={o.over}
                          cx={x(o.over)}
                          cy={y(o.score)}
                          r={4.5}
                          fill="rgb(var(--surface))"
                          stroke="rgb(var(--ink))"
                          strokeWidth={2}
                        />
                      ))}
                    {hover !== null
                      ? item.overs
                          .filter((o) => o.over === hover)
                          .map((o) => (
                            <circle
                              key="h"
                              cx={x(o.over)}
                              cy={y(o.score)}
                              r={5}
                              fill={color}
                              stroke="rgb(var(--surface))"
                              strokeWidth={2}
                            />
                          ))
                      : null}
                  </g>
                );
              })
            : innings.map((item, index) => {
                const color = colorOf(item.team);
                return (
                  <g key={item.inningsId} opacity={index >= 2 ? 0.6 : 1}>
                    {item.overs.map((o) => {
                      const left = x(o.over - 1) + 2 + index * (barW + barGap);
                      const top = y(o.runs);
                      const h = Math.max(0, M.top + plotH - top);
                      const r = Math.min(3, barW / 2, h);
                      return (
                        <g key={o.over} opacity={hover === null || hover === o.over ? 1 : 0.45}>
                          <path
                            d={`M${left},${top + h} V${top + r} Q${left},${top} ${left + r},${top} H${left + barW - r} Q${left + barW},${top} ${left + barW},${top + r} V${top + h} Z`}
                            fill={color}
                          />
                          {Array.from({ length: o.wicketsInOver }, (_, k) => (
                            <circle
                              key={k}
                              cx={left + barW / 2}
                              cy={top - 6 - k * 9}
                              r={3.5}
                              fill="rgb(var(--ink))"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

          <rect
            x={M.left}
            y={M.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && hoverRows.length > 0 ? (
          <div
            className="pointer-events-none absolute top-2 z-10 w-max max-w-[260px] rounded-lg border border-line bg-surface2/95 px-3 py-2 text-[12px] shadow-lift backdrop-blur"
            style={{
              left: Math.min(Math.max(tooltipLeft + 12, 0), width - 250),
            }}
          >
            <p className="font-semibold text-ink">Over {hover}</p>
            {hoverRows.map(({ item, point }) => (
              <div key={item.inningsId} className="mt-1.5">
                <p className="flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: colorOf(item.team) }} />
                  <span className="font-medium text-ink">{item.team}</span>
                  <span className="tnum">
                    {point!.score}/{point!.wickets}
                  </span>
                  <span className="tnum text-faint">
                    · {point!.runs} this over · RR {(point!.score / point!.over).toFixed(1)}
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {point!.balls.map((ball, k) => (
                    <BallChip key={k} ball={ball} size={18} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
