"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: "0px 0px -10% 0px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${seen ? "in" : ""} ${className}`}>{children}</div>;
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { n } = useI18n();
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1600);
      setV(to * (1 - (1 - k) ** 4));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref} className="tabular-nums">{n(Math.round(v))}{suffix}</span>;
}

export function Title({ kicker, title, sub, center }: { kicker?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={`mb-10 ${center ? "text-center mx-auto" : ""} max-w-3xl`}>
      {kicker && <p className="mb-3 text-sm font-semibold grad-text">{kicker}</p>}
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted sm:text-xl">{sub}</p>}
    </Reveal>
  );
}

/** Animated donut from [{pct, color}] slices. */
export function Donut({ slices, children, size = 220 }: { slices: { pct: number; color: string }[]; children?: React.ReactNode; size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(id); }, []);
  const r = 42, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        {slices.map((s, i) => {
          const len = (s.pct / 100) * C;
          const el = (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="10" strokeLinecap="butt"
              strokeDasharray={`${on ? Math.max(len - 0.6, 0) : 0} ${C}`} strokeDashoffset={-acc}
              style={{ transition: `stroke-dasharray 1.4s cubic-bezier(.2,.7,.2,1) ${i * 120}ms` }} />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass spot rounded-[28px] p-6 sm:p-8 ${className}`}>{children}</div>;
}
