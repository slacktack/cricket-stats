"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Stagger helper: d(2) => 140ms. Applied to any [data-rv] element. */
export const d = (i: number): CSSProperties =>
  ({ "--gd": `${i * 70}ms` } as CSSProperties);

/**
 * One observer for the whole document, so plain server markup can opt into a
 * reveal with `data-rv` alone and no component has to become a client island.
 */
export function RevealRoot() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll("[data-rv]")
        .forEach((n) => n.setAttribute("data-in", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    /* A WeakSet, not a DOM attribute: in dev React mounts effects twice, and a
       marker left on the node would hide it from the observer that survives. */
    const watched = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll("[data-rv]:not([data-in])").forEach((n) => {
        if (watched.has(n)) return;
        watched.add(n);
        io.observe(n);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}

/** Fixed printed-matter layers: crumpled stock + column ruling. */
export function Stock() {
  const pathname = usePathname();
  return (
    <>
      <div className="stock" aria-hidden="true" />
      <div className="cols" aria-hidden="true" key={`c-${pathname}`}>
        {Array.from({ length: 13 }, (_, i) => (
          <i key={i} style={{ "--gi": i } as CSSProperties} />
        ))}
      </div>
    </>
  );
}

/** Scroll traced around the viewport perimeter — reads as innings progress. */
export function ScrollFrame() {
  useEffect(() => {
    const f = document.getElementById("au-frame");
    if (!f) return;
    let raf = 0;

    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const seg = (i: number) =>
        Math.min(1, Math.max(0, p * 4 - i)).toFixed(4);
      f.style.setProperty("--p0", seg(0));
      f.style.setProperty("--p1", seg(1));
      f.style.setProperty("--p2", seg(2));
      f.style.setProperty("--p3", seg(3));
      f.toggleAttribute("data-on", p > 0.002);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="frame" id="au-frame" aria-hidden="true">
      <i className="f0" />
      <i className="f1" />
      <i className="f2" />
      <i className="f3" />
    </div>
  );
}

/** Accent page-turn that wipes across on every navigation. */
export function PageTurn() {
  const pathname = usePathname();
  const first = useRef(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!show) return null;
  return (
    <div className="turn" aria-hidden="true">
      <i />
    </div>
  );
}

/** Author the line breaks — one mask per semantic line. */
export function Lines({
  lines,
  className,
  as: Tag = "span",
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
}) {
  return (
    <Tag className={cn("lines", className)} data-rv="">
      {lines.map((l, i) => (
        <span className="line" key={i}>
          <span style={d(i + delay)}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Editorial section eyebrow: a Klein chip carrying the number, then the label. */
export function Kicker({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <p className="kicker" data-rv="">
      {n ? <b>{n}</b> : null}
      {children}
    </p>
  );
}

/** Section head on the shared 12-column rhythm. */
export function SecHead({
  n,
  kicker,
  title,
  lede,
  action,
}: {
  n?: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="sec-head">
      <Kicker n={n}>{kicker}</Kicker>
      <h2 className="text-[clamp(26px,3.4vw,48px)]">{title}</h2>
      {lede ? (
        <p className="lede" data-rv="" style={d(1)}>
          {lede}
        </p>
      ) : (
        <span />
      )}
      {action ? (
        <div className="col-span-12 mt-2" data-rv="">
          {action}
        </div>
      ) : null}
    </div>
  );
}

const NUM = /^([^\d]*)([\d,]*\.?\d+)(.*)$/;

/**
 * Counts up on first intersection. Preserves prefix, suffix, decimals and
 * thousands separators, and hands the real string back at the end.
 */
export function Count({
  value,
  className,
  style,
  dur = 1400,
}: {
  value: string | number;
  className?: string;
  style?: CSSProperties;
  dur?: number;
}) {
  const text = String(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const m = NUM.exec(text);
    if (!m) return;
    const [, pre, num, suf] = m;
    const target = Number(num.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = (num.split(".")[1] ?? "").length;
    const grouped = num.includes(",");
    const fmt = (n: number) =>
      grouped
        ? n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : n.toFixed(decimals);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = text;
      return;
    }

    node.setAttribute("aria-label", text);
    node.textContent = pre + fmt(0) + suf;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 4);
          node.textContent = pre + fmt(target * e) + suf;
          if (p < 1) raf = requestAnimationFrame(step);
          else node.textContent = text;
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text, dur]);

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  );
}

/** Grain inside a bled section; pauses when off-screen. */
export function Grain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting
        ? node.setAttribute("data-run", "")
        : node.removeAttribute("data-run"),
      { threshold: 0.02 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className="grain" aria-hidden="true" />;
}
