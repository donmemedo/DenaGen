"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Helix from "@/components/Helix";
import { Card, CountUp, Donut, Reveal, Title } from "@/components/ui";
import { api, Kit } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const REGIONS = [["Persian", "فارس"], ["Azerbaijani", "آذری"], ["Kurdish", "کرد"], ["Lur & Bakhtiari", "لر و بختیاری"], ["Gilaki & Mazani", "گیلک و مازنی"],
  ["Baloch", "بلوچ"], ["Arab", "عرب"], ["Turkmen", "ترکمن"], ["Caucasus", "قفقاز"], ["Central Asia", "آسیای میانه"], ["Anatolia", "آناتولی"], ["South Asia", "جنوب آسیا"]];
const DEMO = [{ pct: 46, color: "#8b5cf6", l: REGIONS[0] }, { pct: 22, color: "#06b6d4", l: REGIONS[1] }, { pct: 14, color: "#10b981", l: REGIONS[4] }, { pct: 11, color: "#f43f5e", l: REGIONS[2] }, { pct: 7, color: "#f59e0b", l: REGIONS[3] }];

const Arrow = () => <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>;

export default function Home() {
  const { t, n, pc, lang } = useI18n();
  const fa = lang === "fa" ? 1 : 0;
  const [stats, setStats] = useState({ members: 128400, reports: 96210, research: 71000, regions: 48 });
  const [kits, setKits] = useState<Kit[]>([]);
  useEffect(() => {
    api<typeof stats>("/stats").then(setStats).catch(() => {});
    api<Kit[]>("/kits").then(setKits).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pt-14 text-center sm:pt-24">
        <div className="fade-up glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
          <span className="size-2 animate-pulse rounded-full bg-a2" /> {t("eyebrow")}
        </div>
        <h1 className="fade-up mt-6 text-[clamp(2.6rem,9vw,7.2rem)] font-extrabold leading-[1.02] tracking-tighter [animation-delay:.1s]">
          {t("h1a")}<br /><span className="grad-text">{t("h1b")}</span>
        </h1>
        <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl [animation-delay:.2s]">{t("heroSub")}</p>
        <div className="fade-up mt-9 flex flex-wrap justify-center gap-3 [animation-delay:.3s]">
          <Link href="/order" className="btn btn-primary group text-lg">{t("ctaOrder")} <Arrow /></Link>
          <Link href="/report?code=demo" className="btn btn-ghost text-lg">{t("ctaDemo")}</Link>
        </div>
      </section>
      <div className="relative -mt-2 h-[200px] sm:h-[300px]"><Helix /></div>

      {/* region marquee */}
      <div dir="ltr" className="relative overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="marquee flex w-max gap-3">
          {[...REGIONS, ...REGIONS].map((r, i) => (
            <span key={i} className="glass whitespace-nowrap rounded-full px-5 py-2 text-sm text-muted">{r[fa]}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {([["members", "stMembers"], ["reports", "stReports"], ["research", "stResearch"], ["regions", "stRegions"]] as const).map(([k, l], i) => (
          <Reveal key={k} delay={i * 80}>
            <Card className="!p-5 sm:!p-7">
              <div className="text-3xl font-bold tracking-tight sm:text-5xl"><CountUp to={stats[k]} suffix={k === "regions" ? "" : "+"} /></div>
              <div className="mt-1 text-sm text-muted">{t(l)}</div>
            </Card>
          </Reveal>
        ))}
      </section>

      {/* BENTO */}
      <section className="mx-auto mt-32 max-w-6xl px-4">
        <Title kicker={t("brand")} title={t("offTitle")} sub={t("offSub")} />
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2 md:row-span-2">
            <Card className="flex h-full flex-col gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold tracking-tight">{t("o1t")}</h3>
                <p className="mt-3 text-muted">{t("o1d")}</p>
                <ul className="mt-6 space-y-2">
                  {DEMO.map((d) => (
                    <li key={d.color} className="flex items-center gap-3 text-sm">
                      <span className="size-3 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1">{d.l[fa]}</span>
                      <span className="tabular-nums text-muted">{pc(d.pct)}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/report?code=demo" className="group mt-8 inline-flex gap-2 font-semibold text-a1">{t("o1c")} <Arrow /></Link>
              </div>
              <div className="mx-auto"><Donut slices={DEMO} size={240}><div><div className="text-4xl font-bold">{pc(46)}</div><div className="text-sm text-muted">{REGIONS[0][fa]}</div></div></Donut></div>
            </Card>
          </Reveal>
          <Reveal delay={100}>
            <Card className="h-full">
              <div className="flex h-20 items-end gap-1.5">
                {[40, 70, 55, 90, 65, 80, 45].map((h, i) => <div key={i} className="grad-bg flex-1 rounded-t-md opacity-80" style={{ height: `${h}%` }} />)}
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">{t("o2t")}</h3>
              <p className="mt-2 text-muted">{t("o2d")}</p>
              <Link href="/research" className="group mt-5 inline-flex gap-2 font-semibold text-a1">{t("o2c")} <Arrow /></Link>
            </Card>
          </Reveal>
          <Reveal delay={200}>
            <Card className="h-full">
              <pre dir="ltr" className="overflow-hidden rounded-2xl bg-bg2 p-4 text-xs leading-relaxed text-muted"><span className="text-a2">GET</span> /api/reports/demo{"\n"}{"{"} <span className="text-a1">&quot;regions&quot;</span>: [...],{"\n"}  <span className="text-a1">&quot;traits&quot;</span>: [...] {"}"}</pre>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">{t("o3t")}</h3>
              <p className="mt-2 text-muted">{t("o3d")}</p>
              <Link href="/developers" className="group mt-5 inline-flex gap-2 font-semibold text-a1">{t("o3c")} <Arrow /></Link>
            </Card>
          </Reveal>
          <Reveal className="md:col-span-3">
            <Card className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="md:w-1/3">
                <h3 className="text-2xl font-bold tracking-tight">{t("o4t")}</h3>
                <p className="mt-2 text-muted">{t("o4d")}</p>
                <Link href="/report?tab=raw" className="group mt-5 inline-flex gap-2 font-semibold text-a1">{t("o4c")} <Arrow /></Link>
              </div>
              <div dir="ltr" className="flex flex-1 items-end gap-1 overflow-hidden">
                {Array.from({ length: 23 }, (_, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="grad-bg w-full rounded-full opacity-80" style={{ height: 30 + ((23 - i) * 5 + (i % 3) * 7) }} />
                    <span className="hidden text-[10px] text-muted sm:block">{i === 22 ? "X" : i + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto mt-32 max-w-6xl px-4">
        <Title title={t("howTitle")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["s1", "s2", "s3", "s4"] as const).map((s, i) => (
            <Reveal key={s} delay={i * 100}>
              <Card className="h-full">
                <div className="grad-text text-6xl font-extrabold">{n(i + 1)}</div>
                <h3 className="mt-4 text-xl font-bold">{t(`${s}t`)}</h3>
                <p className="mt-2 text-muted">{t(`${s}d`)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto mt-32 max-w-6xl px-4">
        <Title title={t("priceTitle")} sub={t("priceSub")} center />
        <div className="grid gap-4 md:grid-cols-3">
          {(kits.length ? kits : [null, null, null]).map((k, i) => (
            <Reveal key={k?.id ?? i} delay={i * 100}>
              {k ? (
                <div className={`spot relative flex h-full flex-col rounded-[28px] p-8 ${k.popular ? "ring-grad shadow-[0_30px_80px_-30px_var(--a1)] md:-translate-y-3" : "glass"}`}>
                  {k.popular && <span className="grad-bg absolute -top-3 start-8 rounded-full px-3 py-1 text-xs font-semibold text-white">{t("popular")}</span>}
                  <h3 className="text-xl font-bold">{k[lang]}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{n(k.price)}</span>
                    <span className="text-muted">{t("toman")}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {k.features[lang].map((f) => <li key={f} className="flex gap-3"><span className="text-a2">✓</span>{f}</li>)}
                  </ul>
                  <Link href={`/order?kit=${k.id}`} className={`btn mt-8 ${k.popular ? "btn-primary" : "btn-ghost"}`}>{t("choose")}</Link>
                </div>
              ) : <div className="glass h-96 animate-pulse rounded-[28px]" />}
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto mt-32 max-w-6xl px-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[#0a0a0f] p-8 text-white sm:p-14">
            <div aria-hidden className="grad-bg absolute -end-32 -top-32 size-96 rounded-full opacity-40 blur-3xl" />
            <h2 className="relative text-4xl font-bold tracking-tight sm:text-6xl">{t("privTitle")}</h2>
            <div className="relative mt-10 grid gap-8 md:grid-cols-3">
              {(["p1", "p2", "p3"] as const).map((p) => (
                <div key={p}>
                  <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-white/10">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold">{t(`${p}t`)}</h3>
                  <p className="mt-1 text-white/60">{t(`${p}d`)}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto mt-32 max-w-4xl px-4 text-center">
        <Reveal>
          <h2 className="text-5xl font-extrabold tracking-tighter sm:text-7xl"><span className="grad-text">{t("finalCta")}</span></h2>
          <Link href="/order" className="btn btn-primary group mt-10 text-lg">{t("ctaOrder")} <Arrow /></Link>
        </Reveal>
      </section>
    </>
  );
}
