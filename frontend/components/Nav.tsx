"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";

function toggleTheme(e: React.MouseEvent) {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const apply = () => {
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  // circular reveal from the button
  const { clientX: x, clientY: y } = e;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  doc.startViewTransition(apply).ready.then(() =>
    root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 650, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" }),
  );
}

export default function Nav() {
  const { t, lang, setLang } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    ["/report", t("navReport")],
    ["/research", t("navResearch")],
    ["/developers", t("navDev")],
  ] as const;

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav className="glass mx-auto flex max-w-6xl items-center gap-2 rounded-full py-2 ps-4 pe-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setOpen(false)}>
          <Logo /> {t("brand")}
        </Link>
        <div className="ms-6 hidden gap-1 md:flex">
          {links.map(([h, l]) => (
            <Link key={h} href={h} className={`rounded-full px-4 py-2 text-sm transition hover:text-fg ${path.startsWith(h) ? "bg-fg/5 text-fg" : "text-muted"}`}>
              {l}
            </Link>
          ))}
        </div>
        <div className="ms-auto flex items-center gap-1">
          <button onClick={() => setLang(lang === "fa" ? "en" : "fa")} className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-fg/5 hover:text-fg" aria-label="Language">
            {lang === "fa" ? "EN" : "فا"}
          </button>
          <button onClick={toggleTheme} className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-fg/5 hover:text-fg" aria-label={t("theme")} title={t("theme")}>
            <svg viewBox="0 0 24 24" className="size-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            <svg viewBox="0 0 24 24" className="hidden size-5 dark:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </button>
          <Link href="/order" className="btn btn-primary hidden !px-5 !py-2 text-sm sm:inline-flex">{t("navOrder")}</Link>
          <button onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full hover:bg-fg/5 md:hidden" aria-label={t("menu")} aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass fade-up mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-3 md:hidden">
          {[...links, ["/order", t("navOrder")] as const].map(([h, l]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-lg font-medium hover:bg-fg/5">{l}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
