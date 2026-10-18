export type L = { en: string; fa: string };
export type Kit = L & { id: string; price: number; popular: boolean; features: { en: string[]; fa: string[] } };
export type Trait = L & { id: string; rsid: string; gene: string; icon: string; genotype: string | null; result: (L & { level: number }) | null };
export type Region = L & { id: string; color: string; pct: number };
export type Report = {
  code: string; regions: Region[]; snps: number; neanderthal: number; relatives_count: number;
  painting: { name: string; segments: { region: string; start: number; end: number }[] }[];
  haplogroups: { maternal: string; paternal: string };
  relatives: (L & { initials: string; cm: number })[];
  traits: Trait[];
};
export type ReportStatus = { code: string; stage: number; stages: string[]; eta: number; report: Report | null };
export type Genome = { total: number; called: number; no_calls: number; call_rate: number; heterozygosity: number; build: string | null; chromosomes: { name: string; snps: number }[]; traits: Trait[] };
export type Survey = L & { id: string; minutes: number; responses: number; about: L; questions: (L & { id: string; options: { en: string[]; fa: string[] } })[] };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api${path}`, init);
  if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
  return r.json();
}

export const post = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
