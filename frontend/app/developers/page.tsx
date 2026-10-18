"use client";
import { useState } from "react";
import { Card, Reveal, Title } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const ROUTES: [string, string, string, string][] = [
  ["GET", "/api/kits", "List DNA kits and prices", "فهرست کیت‌ها و قیمت‌ها"],
  ["POST", "/api/orders", "Place an order, returns a tracking code", "ثبت سفارش و دریافت کد پیگیری"],
  ["GET", "/api/reports/{code}", "Lab status and full DNA report", "وضعیت آزمایشگاه و گزارش کامل DNA"],
  ["POST", "/api/genome/analyze", "Analyze an uploaded raw genotype file", "تحلیل فایل داده خام بارگذاری‌شده"],
  ["GET", "/api/genome/sample", "Download a synthetic raw data file", "دریافت فایل داده خام نمونه"],
  ["GET", "/api/surveys", "List research surveys", "فهرست پرسش‌نامه‌های پژوهشی"],
  ["POST", "/api/surveys/{id}/responses", "Submit answers, returns community results", "ثبت پاسخ و دریافت نتایج جمعی"],
  ["GET", "/api/stats", "Platform statistics", "آمار پلتفرم"],
];

const SNIPPETS = {
  curl: `curl http://localhost:3055/api/reports/DEMO`,
  js: `const res = await fetch("/api/reports/DEMO");
const { report } = await res.json();
console.log(report.regions[0]); // { en: "Persian", pct: 46.2, ... }`,
  python: `import httpx
r = httpx.get("http://localhost:3055/api/reports/DEMO").json()
for region in r["report"]["regions"]:
    print(region["en"], region["pct"])`,
};

export default function Developers() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<keyof typeof SNIPPETS>("js");
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <Title title={t("devTitle")} sub={t("devSub")} />
      <Reveal><a href="/docs" target="_blank" className="btn btn-primary">{t("openDocs")} ↗</a></Reveal>

      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card>
            <h2 className="text-2xl font-bold tracking-tight">{t("routes")}</h2>
            <ul className="mt-6 divide-y divide-line">
              {ROUTES.map(([m, p, en, fa]) => (
                <li key={m + p} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <div dir="ltr" className="flex items-center gap-3 sm:w-72">
                    <span className={`w-14 rounded-md py-0.5 text-center text-xs font-bold ${m === "GET" ? "bg-a2/15 text-a2" : "bg-a3/15 text-a3"}`}>{m}</span>
                    <code className="text-sm">{p}</code>
                  </div>
                  <span className="text-sm text-muted">{lang === "fa" ? fa : en}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
        <Reveal className="lg:col-span-2" delay={100}>
          <Card className="h-full">
            <h2 className="text-2xl font-bold tracking-tight">{t("quick")}</h2>
            <div className="mt-6 inline-flex rounded-full bg-bg2 p-1" dir="ltr">
              {(Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[]).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm ${tab === k ? "bg-fg text-bg" : "text-muted"}`}>{k}</button>
              ))}
            </div>
            <pre dir="ltr" className="mt-4 overflow-x-auto rounded-2xl bg-[#0a0a0f] p-5 text-sm leading-relaxed text-[#e5e5ea]"><code>{SNIPPETS[tab]}</code></pre>
            <p className="mt-6 text-sm text-muted">{t("consent")}</p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
