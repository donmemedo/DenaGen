"use client";
import { use, useEffect, useState } from "react";
import { Card, CountUp, Donut, Reveal } from "@/components/ui";
import { api, Genome, Report, ReportStatus, Trait } from "@/lib/api";
import { Key, useI18n } from "@/lib/i18n";

// approximate chromosome lengths (Mb) so the painting looks like a real karyotype
const SIZES = [249, 243, 198, 191, 181, 171, 159, 146, 141, 136, 135, 133, 115, 107, 102, 90, 83, 80, 59, 64, 47, 51, 155];

export default function ReportPage({ searchParams }: PageProps<"/report">) {
  const sp = use(searchParams);
  const { t } = useI18n();
  const [tab, setTab] = useState<"report" | "raw">(sp.tab === "raw" ? "raw" : "report");
  const [code, setCode] = useState(typeof sp.code === "string" ? sp.code : "");
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(c: string, quiet = false) {
    if (!c.trim()) return;
    if (!quiet) { setLoading(true); setErr(""); }
    try {
      setStatus(await api<ReportStatus>(`/reports/${encodeURIComponent(c.trim())}`));
      if (!quiet) history.replaceState(null, "", `?code=${encodeURIComponent(c.trim())}`);
    } catch { if (!quiet) { setErr(t("notFound")); setStatus(null); } }
    setLoading(false);
  }
  useEffect(() => { if (code) load(code); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!status || status.report) return;
    const id = setTimeout(() => load(status.code, true), 3000);
    return () => clearTimeout(id);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <h1 className="fade-up text-5xl font-bold tracking-tight sm:text-6xl">{t("repTitle")}</h1>
      <div className="fade-up glass mt-6 inline-flex rounded-full p-1" role="tablist">
        {(["report", "raw"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${tab === k ? "bg-fg text-bg shadow" : "text-muted hover:text-fg"}`}>
            {t(k === "report" ? "tabReport" : "tabRaw")}
          </button>
        ))}
      </div>

      {tab === "raw" ? <RawExplorer /> : (
        <>
          <p className="mt-8 text-lg text-muted">{t("repSub")}</p>
          <form onSubmit={(e) => { e.preventDefault(); load(code); }} className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
            <input dir="ltr" className="input flex-1 font-mono uppercase" placeholder="RSH-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} aria-label={t("repTitle")} />
            <button className="btn btn-primary" disabled={loading}>{t("open")}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setCode("DEMO"); load("DEMO"); }}>{t("demo")}</button>
          </form>
          {err && <p className="mt-3 text-rose-500" role="alert">{err}</p>}
          {loading && <div className="glass mt-10 h-72 animate-pulse rounded-[28px]" />}
          {!loading && status && (status.report ? <ReportView r={status.report} key={status.code} /> : <Timeline s={status} />)}
        </>
      )}
    </section>
  );
}

function Timeline({ s }: { s: ReportStatus }) {
  const { t } = useI18n();
  return (
    <Card className="fade-up mt-10">
      <h2 className="text-2xl font-bold">{t("onTheWay")}</h2>
      <p className="mt-1 text-muted">{t("eta", { n: s.eta })}</p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-5">
        {s.stages.map((st, i) => (
          <li key={st} className="flex items-center gap-3 sm:flex-col sm:items-start">
            <div className={`h-1.5 w-full rounded-full transition-all duration-700 max-sm:hidden ${i <= s.stage ? "grad-bg" : "bg-line"}`} />
            <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm sm:hidden ${i <= s.stage ? "grad-bg text-white" : "bg-line"}`}>{i < s.stage ? "✓" : i + 1}</span>
            <span className={`text-sm ${i === s.stage ? "font-semibold" : i < s.stage ? "" : "text-muted"}`}>
              {t(st as Key)} {i === s.stage && <span className="ms-1 inline-block size-2 animate-ping rounded-full bg-a2" />}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function ReportView({ r }: { r: Report }) {
  const { t, n, pc, lang } = useI18n();
  const color = Object.fromEntries(r.regions.map((x) => [x.id, x.color]));
  const name = Object.fromEntries(r.regions.map((x) => [x.id, x[lang]]));
  const [on, setOn] = useState(false);
  useEffect(() => { const id = setTimeout(() => setOn(true), 150); return () => clearTimeout(id); }, []);

  return (
    <div className="mt-10 space-y-4">
      <div className="fade-up flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <code dir="ltr" className="text-sm text-muted">{r.code}</code>
        <span className="text-sm text-muted"><CountUp to={r.snps} /> {t("markers")}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="fade-up lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight">{t("ancestry")}</h2>
          <p className="mt-1 text-sm text-muted">{t("ancestrySub")}</p>
          <div className="mt-8 flex flex-col items-center gap-10 md:flex-row">
            <Donut slices={r.regions} size={230}>
              <div><div className="text-4xl font-bold">{pc(r.regions[0].pct)}</div><div className="text-sm text-muted">{r.regions[0][lang]}</div></div>
            </Donut>
            <ul className="w-full flex-1 space-y-4">
              {r.regions.map((x, i) => (
                <li key={x.id}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{x[lang]}</span><span className="tabular-nums text-muted">{pc(x.pct)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full transition-[width] duration-1000 ease-out" style={{ width: on ? `${x.pct}%` : 0, background: x.color, transitionDelay: `${i * 100}ms` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="fade-up [animation-delay:.1s]">
            <p className="text-sm text-muted">{t("neanderthal")}</p>
            <p className="mt-1 text-5xl font-bold grad-text">{pc(r.neanderthal)}</p>
            <p className="text-sm text-muted">{t("neanderthalSub")}</p>
          </Card>
          <Card className="fade-up [animation-delay:.2s]">
            <p className="text-sm text-muted">{t("haplo")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["maternal", "paternal"] as const).map((k) => (
                <div key={k} className="rounded-2xl bg-bg2 p-4">
                  <div dir="ltr" className="text-2xl font-bold text-start">{r.haplogroups[k]}</div>
                  <div className="mt-1 text-xs text-muted">{t(k)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Reveal>
        <Card>
          <h2 className="text-2xl font-bold tracking-tight">{t("painting")}</h2>
          <p className="mt-1 text-sm text-muted">{t("paintingSub")}</p>
          <div dir="ltr" className="mt-8 space-y-1.5">
            {r.painting.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-6 text-end text-xs tabular-nums text-muted">{c.name}</span>
                <div className="flex h-3.5 overflow-hidden rounded-full bg-line transition-[width] duration-1000 ease-out sm:h-4"
                  style={{ width: on ? `${(SIZES[i] / SIZES[0]) * 92}%` : "0%", transitionDelay: `${i * 35}ms` }}>
                  {c.segments.map((s, j) => (
                    <div key={j} title={name[s.region]} className="h-full transition-opacity hover:opacity-70" style={{ width: `${(s.end - s.start) * 100}%`, background: color[s.region] }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {r.regions.map((x) => <span key={x.id} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: x.color }} />{x[lang]}</span>)}
          </div>
        </Card>
      </Reveal>

      <Reveal><Traits traits={r.traits} /></Reveal>

      <Reveal>
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{t("relatives")}</h2>
            <p className="text-muted"><span className="text-2xl font-bold text-fg"><CountUp to={r.relatives_count} /></span> {t("relativesSub")}</p>
          </div>
          <ul className="mt-6 divide-y divide-line">
            {r.relatives.map((x) => (
              <li key={x.initials + x.cm} className="flex items-center gap-4 py-4">
                <span dir="ltr" className="grad-bg grid size-11 place-items-center rounded-full text-sm font-bold text-white">{x.initials}</span>
                <span className="flex-1 font-medium">{x[lang]}</span>
                <span className="text-sm text-muted">{n(x.cm)} {t("cm")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </div>
  );
}

function Traits({ traits }: { traits: Trait[] }) {
  const { t, lang } = useI18n();
  return (
    <Card>
      <h2 className="text-2xl font-bold tracking-tight">{t("traits")}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {traits.map((x) => (
          <div key={x.id} className="spot rounded-3xl border border-line bg-bg2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{x.icon}</span>
              {x.result && (
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((d) => <span key={d} className={`h-1.5 w-4 rounded-full ${d <= x.result!.level ? "grad-bg" : "bg-line"}`} />)}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-muted">{x[lang]}</p>
            <p className="mt-1 text-lg font-semibold">{x.result ? x.result[lang] : t("notTested")}</p>
            <p dir="ltr" className="mt-3 text-xs text-muted text-start">{x.gene} · {x.rsid}{x.genotype && ` · ${x.genotype}`}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RawExplorer() {
  const { t, n, pc } = useI18n();
  const [g, setG] = useState<Genome | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);

  async function analyze(file: Blob, filename = "genome.txt") {
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("file", file, filename);
    try { setG(await api<Genome>("/genome/analyze", { method: "POST", body: fd })); }
    catch { setErr(t("rawErr")); setG(null); }
    setBusy(false);
  }
  async function sample() {
    setBusy(true);
    try { analyze(await (await fetch("/api/genome/sample")).blob(), "sample.txt"); } catch { setErr(t("rawErr")); setBusy(false); }
  }
  const max = Math.max(1, ...(g?.chromosomes.map((c) => c.snps) ?? []));

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold tracking-tight">{t("rawTitle")}</h2>
      <p className="mt-2 max-w-2xl text-muted">{t("rawSub")}</p>

      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) analyze(f, f.name); }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed p-10 text-center transition sm:p-14 ${over ? "border-a1 bg-a1/10 scale-[1.01]" : "border-line glass hover:border-a1/50"}`}>
        <div className="grad-bg grid size-14 place-items-center rounded-2xl text-white">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
        </div>
        <span className="font-medium">{busy ? t("analyzingFile") : t("drop")}</span>
        <span dir="ltr" className="text-xs text-muted">.txt · .zip</span>
        <input type="file" accept=".txt,.zip,.csv,.tsv" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) analyze(f, f.name); e.target.value = ""; }} />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={sample} disabled={busy}>{t("trySample")}</button>
        <a className="btn btn-ghost" href="/api/genome/sample" download>{t("dlSample")}</a>
      </div>
      {err && <p className="mt-3 text-rose-500" role="alert">{err}</p>}

      {g && (
        <div className="mt-10 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[[t("totalSnps"), n(g.total)], [t("callRate"), pc(g.call_rate, 2)], [t("het"), pc(g.heterozygosity, 1)], [t("build"), g.build ?? t("unknown")]].map(([l, v]) => (
              <Card key={l} className="fade-up !p-5"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-2xl font-bold sm:text-3xl">{v}</p></Card>
            ))}
          </div>
          <Card className="fade-up">
            <h3 className="text-xl font-bold">{t("perChrom")}</h3>
            <div dir="ltr" className="mt-6 flex h-48 items-end gap-1">
              {g.chromosomes.map((c) => (
                <div key={c.name} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${c.name}: ${n(c.snps)}`}>
                  <div className="grad-bg w-full rounded-t-md opacity-80 transition group-hover:opacity-100" style={{ height: `${(c.snps / max) * 100}%` }} />
                  <span className="text-[9px] text-muted sm:text-[10px]">{c.name}</span>
                </div>
              ))}
            </div>
          </Card>
          <Traits traits={g.traits} />
        </div>
      )}
    </div>
  );
}
