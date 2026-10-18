# Risheh · ریشه

Personal-genomics web app for Iran, inspired by 23andMe (`55_23andMe.pdf`): DNA kit ordering, ancestry report, research surveys, open API, and a raw-DNA explorer.
Bilingual Persian (RTL, default) / English, light & dark themes, fully responsive.

## Run

```bash
docker compose up --build
```

- App: http://localhost:3055
- API docs (Swagger): http://localhost:3055/docs (or http://localhost:8055/docs)

## Dev

```bash
cd backend && pip install -r requirements.txt && uvicorn main:app --port 8055 --reload
cd frontend && npm install && npm run dev   # http://localhost:3000, proxies /api to :8055
python backend/test_genome.py                # parser self-check
```

## Layout

- `backend/` — FastAPI + SQLite (`main.py` routes, `genome.py` raw-file parser & trait SNPs)
- `frontend/` — Next.js 16 App Router + Tailwind v4 (`lib/i18n.tsx` holds every fa/en string)

Try it: open **گزارش من → گزارش نمونه** (code `DEMO`), or place an order and watch the simulated lab stages advance (~20 s each).
