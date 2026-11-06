"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MatchOvers } from "@/lib/data/overs";
import { cn } from "@/lib/utils";
import { BallChip } from "@/components/ui/ball-chip";

type Mode = "worm" | "manhattan";

const H = 260;
const M = { top: 16, right: 16, bottom: 28, left: 36 };

/* Klein carries series one, paper white carries series two, coral is only ever a wicket. */
const SERIES = ["rgb(var(--accent))", "rgb(var(--ink) / 0.85)"] as const;
const WICKET = "rgb(var(--wkt))";

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
    SERIES[Math.max(0, Math.min(teams.indexOf(team), SERIES.length - 1))];
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
    <section data-rv style={{ "--gd": "0ms" } as React.CSSProperties} className={cn("blk", className)}>
      <div className="band flex-wrap">
        <h3>{mode === "worm" ? "Cumulative runs" : "Runs per over"}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            {teams.map((team) => (
              <span key={team} className="inline-flex items-center gap-1.5">
                <span className="swatch mt-0" style={{ background: colorOf(team) }} />
                {team}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="swatch mt-0" style={{ background: WICKET }} />
              Wicket
            </span>
          </div>
          <div className="segmented ml-auto">
            {(["worm", "manhattan"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                aria-pressed={mode === item}
                data-active={mode === item}
                className="segmented-item"
              >
                {item === "worm" ? "Runs" : "Per over"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={ref} className="relative px-2 pb-2 pt-3">
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
                style={{ stroke: tick === 0 ? "rgb(var(--line-strong))" : "rgb(var(--line))" }}
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text
                x={M.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-faint text-[10px] font-semibold tabular-nums"
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
              className="fill-faint text-[10px] font-semibold tabular-nums"
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
              style={{ stroke: "rgb(var(--line-strong))" }}
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
                      style={{ stroke: color }}
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
                          r={4}
                          fill="none"
                          style={{ stroke: WICKET }}
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
                              style={{ fill: color, stroke: "rgb(var(--bg))" }}
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
                  <g key={item.inningsId} opacity={index >= 2 ? 0.55 : 1}>
                    {item.overs.map((o) => {
                      const left = x(o.over - 1) + 2 + index * (barW + barGap);
                      const top = y(o.runs);
                      const h = Math.max(0, M.top + plotH - top);
                      return (
                        <g key={o.over} opacity={hover === null || hover === o.over ? 1 : 0.4}>
                          <rect x={left} y={top} width={barW} height={h} style={{ fill: color }} />
                          {Array.from({ length: o.wicketsInOver }, (_, k) => (
                            <rect
                              key={k}
                              x={left + barW / 2 - 2}
                              y={top - 8 - k * 8}
                              width={4}
                              height={4}
                              style={{ fill: WICKET }}
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
            className="pointer-events-none absolute top-2 z-10 w-max max-w-[280px] border border-line bg-surface px-3 py-2"
            style={{ left: Math.min(Math.max(tooltipLeft + 12, 0), width - 250) }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
              Over {hover}
            </p>
            {hoverRows.map(({ item, point }) => (
              <div key={item.inningsId} className="mt-2 border-t border-line pt-2 first:border-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                  <span className="swatch mt-0" style={{ background: colorOf(item.team) }} />
                  <span className="font-bold text-ink">{item.team}</span>
                  <span className="dnum">
                    {point!.score}/{point!.wickets}
                  </span>
                  <span className="text-faint">
                    +{point!.runs} this over · RR {(point!.score / point!.over).toFixed(2)}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
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
