"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { api, Kit, post } from "@/lib/api";
import { latinDigits, useI18n } from "@/lib/i18n";

const CITIES = [["Tehran", "تهران"], ["Mashhad", "مشهد"], ["Isfahan", "اصفهان"], ["Karaj", "کرج"], ["Shiraz", "شیراز"], ["Tabriz", "تبریز"], ["Qom", "قم"], ["Ahvaz", "اهواز"], ["Kermanshah", "کرمانشاه"], ["Rasht", "رشت"]];

export default function Order({ searchParams }: PageProps<"/order">) {
  const sp = use(searchParams);
  const { t, n, lang } = useI18n();
  const [kits, setKits] = useState<Kit[]>([]);
  const [kit, setKit] = useState(typeof sp.kit === "string" ? sp.kit : "health");
  const [f, setF] = useState({ name: "", phone: "", city: "", address: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { api<Kit[]>("/kits").then(setKits).catch(() => setErr(t("errGeneric"))); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const phone = latinDigits(f.phone).replace(/\D/g, "");
  const errors = {
    name: f.name.trim().length < 2 && t("errEmpty"),
    phone: !/^09\d{9}$/.test(phone) && (f.phone ? t("errPhone") : t("errEmpty")),
    city: f.city.trim().length < 2 && t("errEmpty"),
    address: f.address.trim().length < 8 && (f.address ? t("errAddress") : t("errEmpty")),
  };
  const selected = kits.find((k) => k.id === kit);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true); setErr("");
    try {
      setDone(await post<{ code: string; amount: number }>("/orders", { kit, ...f, phone, name: f.name.trim(), city: f.city.trim(), address: f.address.trim() }));
      scrollTo({ top: 0, behavior: "smooth" });
    } catch { setErr(t("errGeneric")); }
    setBusy(false);
  }

  if (done) return (
    <section className="mx-auto max-w-xl px-4 pt-20 text-center">
      <div className="fade-up grad-bg mx-auto grid size-24 place-items-center rounded-full text-5xl text-white shadow-[0_20px_60px_-10px_var(--a1)]">✓</div>
      <h1 className="fade-up mt-8 text-4xl font-bold tracking-tight sm:text-5xl">{t("success")}</h1>
      <p className="fade-up mt-4 text-muted">{t("successSub")}</p>
      <Card className="fade-up mt-8 flex items-center justify-between gap-4 !p-5">
        <code dir="ltr" className="text-xl font-bold tracking-widest sm:text-2xl">{done.code}</code>
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => { navigator.clipboard?.writeText(done.code); setCopied(true); }}>{copied ? t("copied") : t("copy")}</button>
      </Card>
      <Link href={`/report?code=${done.code}`} className="btn btn-primary fade-up mt-8">{t("track")}</Link>
    </section>
  );

  const field = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={touched && !!errors[k]} {...props} />
      {touched && errors[k] && <span className="mt-1.5 block text-sm text-rose-500">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-6xl px-4 pt-12">
      <h1 className="fade-up text-5xl font-bold tracking-tight sm:text-6xl">{t("orderTitle")}</h1>
      <p className="fade-up mt-3 text-lg text-muted">{t("orderSub")}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-5 text-xl font-bold"><span className="grad-text">{n(1)}.</span> {t("step1")}</h2>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
              {(kits.length ? kits : [null, null, null]).map((k, i) => k ? (
                <button type="button" role="radio" aria-checked={kit === k.id} key={k.id} onClick={() => setKit(k.id)}
                  className={`rounded-2xl p-4 text-start transition ${kit === k.id ? "ring-grad scale-[1.02]" : "border border-line bg-bg2 hover:border-a1/40"}`}>
                  <div className="font-semibold">{k[lang]}</div>
                  <div className="mt-1 text-sm text-muted">{n(k.price)} {t("toman")}</div>
                </button>
              ) : <div key={i} className="h-20 animate-pulse rounded-2xl bg-bg2" />)}
            </div>
          </Card>
          <Card>
            <h2 className="mb-5 text-xl font-bold"><span className="grad-text">{n(2)}.</span> {t("step2")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("name", t("fName"), { autoComplete: "name" })}
              {field("phone", t("fPhone"), { inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: t("phoneHint"), className: "input text-start" })}
              {field("city", t("fCity"), { list: "cities", autoComplete: "address-level2" })}
              <datalist id="cities">{CITIES.map((c) => <option key={c[0]} value={c[lang === "fa" ? 1 : 0]} />)}</datalist>
              <div className="sm:col-span-2">{field("address", t("fAddress"), { autoComplete: "street-address" })}</div>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <h2 className="text-xl font-bold">{t("summary")}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{selected?.[lang] ?? "—"}</dt><dd>{selected ? `${n(selected.price)} ${t("toman")}` : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">{t("shipping")}</dt><dd className="text-emerald-500">{t("free")}</dd></div>
              <div className="flex justify-between border-t border-line pt-4 text-base font-bold"><dt>{t("total")}</dt><dd>{selected ? `${n(selected.price)} ${t("toman")}` : "—"}</dd></div>
            </dl>
            <button type="submit" disabled={busy || !selected} className="btn btn-primary mt-6 w-full">{busy ? t("processing") : t("pay")}</button>
            <p className="mt-3 text-center text-xs text-muted">{t("payNote")}</p>
            {err && <p className="mt-3 text-center text-sm text-rose-500" role="alert">{err}</p>}
          </Card>
        </aside>
      </div>
    </form>
  );
}
