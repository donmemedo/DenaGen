import hashlib
import hmac
import io
import json
import os
import random
import re
import secrets
import sqlite3
import time
import zipfile

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from genome import CHROMOSOMES, TRAITS, interpret, parse_raw, sample_raw

DB = os.getenv("DB_PATH", "data/risheh.db")
os.makedirs(os.path.dirname(DB) or ".", exist_ok=True)
STAGES = ["ordered", "shipped", "received", "analyzing", "ready"]
STAGE_SECONDS = 20  # ponytail: simulated lab pipeline, replace with real lab webhooks
MAX_UPLOAD = 40 * 1024 * 1024
PHONE = r"^09\d{9}$"
OTP_TTL, RESEND, SESSION_TTL = 120, 60, 30 * 24 * 3600
# ponytail: no SMS provider wired yet; DEV_OTP=1 returns the code in the response so the demo works end to end
DEV_OTP = os.getenv("DEV_OTP", "1") == "1"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "0") == "1"

app = FastAPI(title="Risheh API", version="1.0", description="Personal genomics API — ancestry, traits, research.")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","), allow_methods=["*"], allow_headers=["*"])


def q(sql, args=()):
    with sqlite3.connect(DB) as c:
        return c.execute(sql, args).fetchall()


q("create table if not exists orders (code text primary key, kit text, name text, phone text, city text, address text, created real)")
q("create table if not exists responses (id integer primary key, survey text, answers text, created real)")
q("create table if not exists users (id integer primary key, phone text unique, name text, research_consent integer, created real)")
q("create table if not exists sessions (token text primary key, user_id integer, expires real)")
q("create table if not exists otps (phone text primary key, hash text, sent real, attempts integer)")
if "user_id" not in [c[1] for c in q("pragma table_info(orders)")]:
    q("alter table orders add column user_id integer")

KITS = [
    dict(id="ancestry", price=3_900_000, en="Ancestry", fa="تبار", popular=False,
         features={"en": ["Ancestry composition across 12 regions", "Maternal & paternal haplogroups", "DNA relatives finder", "Raw data download"],
                   "fa": ["ترکیب تبار در ۱۲ منطقه", "هاپلوگروه مادری و پدری", "یافتن خویشاوندان ژنتیکی", "دریافت داده خام"]}),
    dict(id="health", price=6_900_000, en="Health + Ancestry", fa="سلامت + تبار", popular=True,
         features={"en": ["Everything in Ancestry", "Trait reports: taste, caffeine, muscle…", "Wellness & nutrition insights", "Genetic counselor session"],
                   "fa": ["همه امکانات تبار", "گزارش ویژگی‌ها: ذائقه، کافئین، عضله…", "بینش سلامت و تغذیه", "یک جلسه مشاوره ژنتیک"]}),
    dict(id="family", price=19_900_000, en="Family pack", fa="بسته خانواده", popular=False,
         features={"en": ["4 Health + Ancestry kits", "All reports in one account", "Priority lab processing"],
                   "fa": ["۴ کیت سلامت + تبار", "همه گزارش‌ها در یک حساب کاربری", "پردازش سریع‌تر در آزمایشگاه"]}),
]

REGIONS = [
    ("persian", "Persian", "فارس", "#8b5cf6"), ("azeri", "Azerbaijani", "آذری", "#06b6d4"),
    ("kurdish", "Kurdish", "کرد", "#f43f5e"), ("lur", "Lur & Bakhtiari", "لر و بختیاری", "#f59e0b"),
    ("caspian", "Gilaki & Mazani", "گیلک و مازنی", "#10b981"), ("baloch", "Baloch", "بلوچ", "#3b82f6"),
    ("arab", "Arab", "عرب", "#ec4899"), ("turkmen", "Turkmen", "ترکمن", "#84cc16"),
    ("caucasus", "Caucasus", "قفقاز", "#a855f7"), ("central_asia", "Central Asia", "آسیای میانه", "#14b8a6"),
    ("south_asia", "South Asia", "جنوب آسیا", "#fb923c"), ("anatolia", "Anatolia", "آناتولی", "#e11d48"),
]

RELATIONS = [("2nd cousin", "عموزاده/خاله‌زاده درجه دو"), ("3rd cousin", "عموزاده/خاله‌زاده درجه سه"),
             ("1st cousin", "عموزاده/خاله‌زاده درجه یک"), ("4th cousin", "عموزاده/خاله‌زاده درجه چهار")]

SURVEYS = [
    dict(id="sleep", minutes=2, en="Sleep & chronotype", fa="خواب و ساعت بدن",
         about={"en": "Help us map genes linked to morning larks and night owls.", "fa": "کمک کنید ژن‌های مرتبط با سحرخیزی و شب‌بیداری را پیدا کنیم."},
         questions=[
             dict(id="type", en="Are you a morning or evening person?", fa="صبح‌ها سرحال‌ترید یا شب‌ها؟",
                  options={"en": ["Morning", "Evening", "Neither"], "fa": ["صبح", "شب", "هیچ‌کدام"]}),
             dict(id="hours", en="How many hours do you usually sleep?", fa="معمولا چند ساعت می‌خوابید؟",
                  options={"en": ["< 6", "6–8", "> 8"], "fa": ["کمتر از ۶", "۶ تا ۸", "بیشتر از ۸"]}),
             dict(id="coffee", en="Does coffee keep you awake at night?", fa="قهوه شب‌ها بی‌خوابتان می‌کند؟",
                  options={"en": ["Yes", "No", "I don't drink coffee"], "fa": ["بله", "خیر", "قهوه نمی‌نوشم"]}),
         ]),
    dict(id="taste", minutes=1, en="Taste & food", fa="ذائقه و غذا",
         about={"en": "Why does cilantro taste like soap to some people?", "fa": "چرا گشنیز برای بعضی‌ها طعم صابون می‌دهد؟"},
         questions=[
             dict(id="cilantro", en="Does cilantro taste like soap to you?", fa="گشنیز برایتان طعم صابون می‌دهد؟",
                  options={"en": ["Yes", "No", "Not sure"], "fa": ["بله", "خیر", "مطمئن نیستم"]}),
             dict(id="spicy", en="How much do you enjoy spicy food?", fa="چقدر غذای تند دوست دارید؟",
                  options={"en": ["Love it", "A little", "Not at all"], "fa": ["خیلی زیاد", "کمی", "اصلا"]}),
             dict(id="sweet", en="Sweet or savory breakfast?", fa="صبحانه شیرین یا شور؟",
                  options={"en": ["Sweet", "Savory", "Both"], "fa": ["شیرین", "شور", "هر دو"]}),
         ]),
    dict(id="family", minutes=2, en="Family roots", fa="ریشه‌های خانوادگی",
         about={"en": "Build the first genetic map of Iran's regions.", "fa": "اولین نقشه ژنتیکی مناطق ایران را با هم بسازیم."},
         questions=[
             dict(id="region", en="Where were your grandparents born?", fa="پدربزرگ و مادربزرگتان کجا به دنیا آمده‌اند؟",
                  options={"en": ["Same province", "Different provinces", "Outside Iran"], "fa": ["یک استان", "استان‌های مختلف", "خارج از ایران"]}),
             dict(id="languages", en="How many languages were spoken at home?", fa="در خانه به چند زبان صحبت می‌شد؟",
                  options={"en": ["One", "Two", "Three or more"], "fa": ["یک", "دو", "سه یا بیشتر"]}),
         ]),
]


def rng(code: str) -> random.Random:
    return random.Random(int(hashlib.sha256(code.upper().encode()).hexdigest(), 16))


def build_report(code: str, kit: str = "health") -> dict:
    r = rng(code)
    picks = r.sample(REGIONS, r.randint(4, 6))
    weights = sorted((r.uniform(0.08, 1) for _ in picks), reverse=True)
    weights[0] += r.uniform(0.3, 1)
    total = sum(weights)
    pct = [round(100 * w / total, 1) for w in weights]
    pct[0] = round(pct[0] + 100 - sum(pct), 1)
    regions = [dict(id=p[0], en=p[1], fa=p[2], color=p[3], pct=v) for p, v in zip(picks, pct)]
    painting = []
    for chrom in CHROMOSOMES[:23]:
        cuts = sorted(r.random() for _ in range(r.randint(2, 6)))
        edges = [0, *cuts, 1]
        segs = [dict(region=r.choices(regions, weights=pct)[0]["id"], start=round(a, 3), end=round(b, 3)) for a, b in zip(edges, edges[1:])]
        painting.append(dict(name=chrom, segments=segs))
    genotypes = {t["rsid"]: r.choice(list(t["map"])) for t in TRAITS}
    relatives = [dict(initials=f"{r.choice('ABDFHKMNRSZ')}.{r.choice('ABDFHKMNRSZ')}.", en=rel[0], fa=rel[1], cm=r.randint(40, 420))
                 for rel in r.sample(RELATIONS, 3)]
    return dict(
        code=code.upper(),
        regions=regions,
        painting=painting,
        haplogroups=dict(maternal=r.choice(["U7a", "H2a", "J1c", "T2b", "HV1", "W6"]), paternal=r.choice(["J2a1", "R1a1", "G2a", "E1b1b", "L1a", "Q1b"])),
        neanderthal=round(r.uniform(1.6, 2.9), 1),
        relatives_count=r.randint(120, 980),
        relatives=sorted(relatives, key=lambda x: -x["cm"]),
        traits=interpret(genotypes) if kit != "ancestry" else [],
        snps=r.randint(630_000, 690_000),
    )


def sha(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def stage_of(created: float) -> int:
    return min(int((time.time() - created) // STAGE_SECONDS), len(STAGES) - 1)


USER_COLS = ("id", "phone", "name", "research_consent", "created")


def current_user(sid: str | None = Cookie(default=None)):
    if not sid:
        return None
    row = q("select u.id, u.phone, u.name, u.research_consent, u.created from sessions s join users u on u.id = s.user_id "
            "where s.token = ? and s.expires > ?", (sha(sid), time.time()))
    return dict(zip(USER_COLS, row[0])) | {"research_consent": bool(row[0][3])} if row else None


def require_user(u=Depends(current_user)):
    if not u:
        raise HTTPException(401, "login_required")
    return u


class PhoneIn(BaseModel):
    phone: str = Field(pattern=PHONE)


class VerifyIn(PhoneIn):
    code: str = Field(pattern=r"^\d{6}$")


class MeIn(BaseModel):
    name: str | None = Field(default=None, max_length=80)
    research_consent: bool | None = None


class OrderIn(BaseModel):
    kit: str
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(pattern=PHONE)
    city: str = Field(min_length=2, max_length=60)
    address: str = Field(min_length=8, max_length=300)


class SurveyIn(BaseModel):
    answers: dict[str, int]


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/kits")
def kits():
    return KITS


@app.get("/api/stats")
def stats():
    orders = q("select count(*) from orders")[0][0]
    responses = q("select count(*) from responses")[0][0]
    return dict(members=128_400 + orders, reports=96_210 + orders, research=71_000 + responses, regions=len(REGIONS))


@app.post("/api/auth/otp")
def send_otp(b: PhoneIn):
    row = q("select sent from otps where phone = ?", (b.phone,))
    if row and time.time() - row[0][0] < RESEND:
        raise HTTPException(429, "wait")
    code = f"{secrets.randbelow(10**6):06d}"
    q("insert or replace into otps values (?,?,?,0)", (b.phone, sha(b.phone + code), time.time()))
    return {"sent": True, "resend_in": RESEND} | ({"dev_code": code} if DEV_OTP else {})


@app.post("/api/auth/verify")
def verify_otp(b: VerifyIn, response: Response):
    row = q("select hash, sent, attempts from otps where phone = ?", (b.phone,))
    if not row or time.time() - row[0][1] > OTP_TTL or row[0][2] >= 5:
        raise HTTPException(400, "expired")
    if not hmac.compare_digest(row[0][0], sha(b.phone + b.code)):
        q("update otps set attempts = attempts + 1 where phone = ?", (b.phone,))
        raise HTTPException(400, "wrong_code")
    q("delete from otps where phone = ?", (b.phone,))
    q("insert or ignore into users (phone, name, research_consent, created) values (?, '', 0, ?)", (b.phone, time.time()))
    uid = q("select id from users where phone = ?", (b.phone,))[0][0]
    token = secrets.token_urlsafe(32)
    q("insert into sessions values (?,?,?)", (sha(token), uid, time.time() + SESSION_TTL))
    response.set_cookie("sid", token, max_age=SESSION_TTL, httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return {"ok": True}


@app.post("/api/auth/logout")
def logout(response: Response, sid: str | None = Cookie(default=None)):
    if sid:
        q("delete from sessions where token = ?", (sha(sid),))
    response.delete_cookie("sid")
    return {"ok": True}


@app.get("/api/me")
def get_me(u=Depends(require_user)):
    kits = {k["id"]: k for k in KITS}
    rows = q("select code, kit, city, created from orders where user_id = ? order by created desc", (u["id"],))
    orders = [dict(code=c, kit=k, en=kits[k]["en"], fa=kits[k]["fa"], city=city, created=cr, stage=stage_of(cr)) for c, k, city, cr in rows]
    return u | {"orders": orders}


@app.patch("/api/me")
def update_me(b: MeIn, u=Depends(require_user)):
    if b.name is not None:
        q("update users set name = ? where id = ?", (b.name.strip(), u["id"]))
    if b.research_consent is not None:
        q("update users set research_consent = ? where id = ?", (int(b.research_consent), u["id"]))
    return get_me(current_user_by_id(u["id"]))


def current_user_by_id(uid: int):
    row = q("select id, phone, name, research_consent, created from users where id = ?", (uid,))
    return dict(zip(USER_COLS, row[0])) | {"research_consent": bool(row[0][3])}


@app.delete("/api/me")
def delete_me(response: Response, u=Depends(require_user)):
    for table, col in (("orders", "user_id"), ("sessions", "user_id"), ("users", "id")):
        q(f"delete from {table} where {col} = ?", (u["id"],))
    response.delete_cookie("sid")
    return {"ok": True}


@app.post("/api/orders", status_code=201)
def create_order(o: OrderIn, u=Depends(require_user)):
    kit = next((k for k in KITS if k["id"] == o.kit), None)
    if not kit:
        raise HTTPException(422, "unknown kit")
    code = "RSH-" + "-".join(secrets.token_hex(2).upper() for _ in range(2))
    q("insert into orders (code, kit, name, phone, city, address, created, user_id) values (?,?,?,?,?,?,?,?)",
      (code, o.kit, o.name, o.phone, o.city, o.address, time.time(), u["id"]))
    if not u["name"]:
        q("update users set name = ? where id = ?", (o.name, u["id"]))
    return {"code": code, "kit": kit, "amount": kit["price"]}


def owned_order(code: str, u):
    """(stage, eta, kit) for DEMO or an order the user owns."""
    code = code.strip().upper()
    if code == "DEMO":
        return code, len(STAGES) - 1, 0, "health"
    if not u:
        raise HTTPException(401, "login_required")
    row = q("select created, kit from orders where code = ? and user_id = ?", (code, u["id"]))
    if not row:
        raise HTTPException(404, "not_found")
    created, kit = row[0]
    return code, stage_of(created), max(0, int(STAGE_SECONDS * (len(STAGES) - 1) - (time.time() - created))), kit


@app.get("/api/reports/{code}")
def report(code: str, u=Depends(current_user)):
    code, stage, eta, kit = owned_order(code, u)
    ready = stage == len(STAGES) - 1
    return dict(code=code, kit=kit, stage=stage, stages=STAGES, eta=eta, report=build_report(code, kit) if ready else None)


@app.get("/api/reports/{code}/raw", response_class=PlainTextResponse)
def report_raw(code: str, u=Depends(current_user)):
    code, stage, _, kit = owned_order(code, u)
    if stage != len(STAGES) - 1:
        raise HTTPException(409, "not_ready")
    genotypes = {t["rsid"]: t["genotype"] for t in build_report(code, "health")["traits"]}
    return PlainTextResponse(sample_raw(int(sha(code)[:8], 16), genotypes=genotypes),
                             headers={"Content-Disposition": f"attachment; filename=risheh_{code}.txt"})


@app.get("/api/surveys")
def surveys():
    counts = dict(q("select survey, count(*) from responses group by survey"))
    return [s | {"responses": 1200 + counts.get(s["id"], 0)} for s in SURVEYS]


@app.post("/api/surveys/{sid}/responses", status_code=201)
def answer(sid: str, body: SurveyIn):
    s = next((s for s in SURVEYS if s["id"] == sid), None)
    if not s:
        raise HTTPException(404, "not found")
    valid = {qn["id"]: len(qn["options"]["en"]) for qn in s["questions"]}
    if any(k not in valid or not 0 <= v < valid[k] for k, v in body.answers.items()):
        raise HTTPException(422, "invalid answer")
    q("insert into responses (survey, answers, created) values (?,?,?)", (sid, json.dumps(body.answers), time.time()))
    # community results: seeded baseline + real answers
    tally = {k: [rng(sid + k + str(i)).randint(80, 400) for i in range(n)] for k, n in valid.items()}
    for (a,) in q("select answers from responses where survey=?", (sid,)):
        for k, v in json.loads(a).items():
            if k in tally and v < len(tally[k]):
                tally[k][v] += 1
    return {"results": tally}


@app.get("/api/genome/sample", response_class=PlainTextResponse)
def genome_sample():
    return PlainTextResponse(sample_raw(), headers={"Content-Disposition": "attachment; filename=risheh_sample_genome.txt"})


@app.post("/api/genome/analyze")
async def genome_analyze(file: UploadFile):
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "file too large")
    if data[:2] == b"PK":
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                name = next(n for n in z.namelist() if n.endswith(".txt"))
                data = z.read(name)[: MAX_UPLOAD * 4]
        except (zipfile.BadZipFile, StopIteration):
            raise HTTPException(422, "no .txt inside zip")
    result = parse_raw(data.decode("utf-8", "ignore"))
    if not result["total"]:
        raise HTTPException(422, "no genotypes found")
    return result
