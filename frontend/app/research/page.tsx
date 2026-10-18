"use client";
import { useEffect, useState } from "react";
import { Card, Reveal, Title } from "@/components/ui";
import { api, post, Survey } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function Research() {
  const { t, n, pc, lang } = useI18n();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [active, setActive] = useState<Survey | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, number[]> | null>(null);
  const [err, setErr] = useState("");

  const refresh = () => api<Survey[]>("/surveys").then(setSurveys).catch(() => setErr(t("errGeneric")));
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = (s: Survey) => { setActive(s); setStep(0); setAnswers({}); setResults(null); setErr(""); scrollTo({ top: 0, behavior: "smooth" }); };
  const close = () => { setActive(null); refresh(); };
  async function submit() {
    try { setResults((await post<{ results: Record<string, number[]> }>(`/surveys/${active!.id}/responses`, { answers })).results); }
    catch { setErr(t("errGeneric")); }
  }

  if (active) {
    const qs = active.questions, q = qs[step];
    return (
      <section className="mx-auto max-w-2xl px-4 pt-12">
        <button onClick={close} className="text-sm text-muted hover:text-fg">
          <span className="inline-block rtl:-scale-x-100">←</span> {t("backSurveys")}
        </button>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{active[lang]}</h1>

        {!results ? (
          <Card className="fade-up mt-8" key={step}>
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="grad-bg h-full rounded-full transition-[width] duration-500" style={{ width: `${((step + 1) / qs.length) * 100}%` }} />
            </div>
            <p className="text-sm text-muted">{t("qOf", { a: step + 1, b: qs.length })}</p>
            <h2 className="mt-2 text-2xl font-bold">{q[lang]}</h2>
            <div className="mt-6 grid gap-2" role="radiogroup">
              {q.options[lang].map((o, i) => (
                <button key={o} role="radio" aria-checked={answers[q.id] === i} onClick={() => setAnswers({ ...answers, [q.id]: i })}
                  className={`rounded-2xl px-5 py-4 text-start font-medium transition ${answers[q.id] === i ? "ring-grad scale-[1.01]" : "border border-line bg-bg2 hover:border-a1/40"}`}>
                  {o}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between gap-2">
              <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>{t("prev")}</button>
              {step < qs.length - 1
                ? <button className="btn btn-primary" disabled={answers[q.id] === undefined} onClick={() => setStep(step + 1)}>{t("next")}</button>
                : <button className="btn btn-primary" disabled={answers[q.id] === undefined} onClick={submit}>{t("submit")}</button>}
            </div>
            {err && <p className="mt-3 text-rose-500" role="alert">{err}</p>}
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="fade-up text-lg">{t("thanks")}</p>
            {qs.map((qq) => {
              const counts = results[qq.id], total = counts.reduce((a, b) => a + b, 0);
              return (
                <Card key={qq.id} className="fade-up">
                  <h3 className="font-semibold">{qq[lang]}</h3>
                  <ul className="mt-4 space-y-3">
                    {qq.options[lang].map((o, i) => {
                      const p = Math.round((100 * counts[i]) / total), mine = answers[qq.id] === i;
                      return (
                        <li key={o}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className={mine ? "font-semibold" : ""}>{o} {mine && <span className="ms-2 rounded-full bg-a1/15 px-2 py-0.5 text-xs text-a1">{t("yourAnswer")}</span>}</span>
                            <span className="tabular-nums text-muted">{pc(p, 0)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${mine ? "grad-bg" : "bg-muted/40"}`} style={{ width: `${p}%` }} /></div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              );
            })}
            <button className="btn btn-ghost" onClick={close}>{t("backSurveys")}</button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <Title title={t("resTitle")} sub={t("resSub")} />
      {err && <p className="text-rose-500" role="alert">{err}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {(surveys.length ? surveys : [null, null, null]).map((s, i) => (
          <Reveal key={s?.id ?? i} delay={i * 100}>
            {s ? (
              <Card className="flex h-full flex-col">
                <div className="flex gap-2 text-xs text-muted">
                  <span className="rounded-full border border-line px-3 py-1">{n(s.minutes)} {t("minutes")}</span>
                  <span className="rounded-full border border-line px-3 py-1">{n(s.responses)} {t("participants")}</span>
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight">{s[lang]}</h2>
                <p className="mt-2 flex-1 text-muted">{s.about[lang]}</p>
                <button className="btn btn-primary mt-8" onClick={() => begin(s)}>{t("start")}</button>
              </Card>
            ) : <div className="glass h-72 animate-pulse rounded-[28px]" />}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
