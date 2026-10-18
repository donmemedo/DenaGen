"use client";
import { useEffect, useRef } from "react";

/** Interactive DNA double helix drawn on canvas; bulges toward the pointer. */
export default function Helix({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, t = 0, raf = 0, frame = 0, mx = -1e4;
    let colors = ["", "", ""];

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = ["--a1", "--a2", "--a3"].map((v) => s.getPropertyValue(v).trim());
    };
    const draw = () => {
      if (frame++ % 60 === 0) readColors();
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, colors[0]); g.addColorStop(0.5, colors[1]); g.addColorStop(1, colors[2]);
      ctx.fillStyle = g; ctx.strokeStyle = g;
      const gap = w < 640 ? 11 : 14, amp = Math.min(h * 0.34, 90), cy = h / 2;
      for (let i = 0, x = -gap; x < w + gap; i++, x += gap) {
        const p = i * 0.3 + t;
        const bulge = 1 + 0.45 * Math.exp(-((x - mx) ** 2) / 18000);
        const wave = Math.sin(i * 0.04 + t * 0.6) * h * 0.06;
        const y1 = cy + wave + Math.sin(p) * amp * bulge, y2 = cy + wave - Math.sin(p) * amp * bulge;
        const z = Math.cos(p);
        if (i % 2 === 0) {
          ctx.globalAlpha = 0.18;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        }
        for (const [y, d] of [[y1, z], [y2, -z]]) {
          ctx.globalAlpha = 0.3 + (d + 1) * 0.35;
          ctx.beginPath(); ctx.arc(x, y, 1.6 + (d + 1) * 1.9, 0, 7); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      t += 0.012;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; };
    const leave = () => { mx = -1e4; };

    resize(); readColors(); draw();
    addEventListener("resize", resize);
    addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
