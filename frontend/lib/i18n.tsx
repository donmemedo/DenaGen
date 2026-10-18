"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "fa";

// [english, persian] — vocabulary follows the Persian UX-writing reference
const S = {
  brand: ["Risheh", "ریشه"],
  navReport: ["My report", "گزارش من"],
  navResearch: ["Research", "پژوهش"],
  navDev: ["Developers", "توسعه‌دهندگان"],
  navOrder: ["Order kit", "سفارش کیت"],
  theme: ["Light / dark", "حالت روشن / تیره"],
  menu: ["Menu", "منو"],

  eyebrow: ["Iran's first ancestry DNA service", "اولین سرویس ژنتیک تبارشناسی ایران"],
  h1a: ["Your story is written", "داستان تو"],
  h1b: ["in your DNA.", "در DNA تو نوشته شده."],
  heroSub: ["Discover where you come from — across 40+ regions of Iran and beyond — with a single saliva sample and 650,000 genetic markers.",
    "با یک نمونه بزاق و بررسی ۶۵۰ هزار نشانگر ژنتیکی، بفهمید ریشه‌تان به کدام‌یک از بیش از ۴۰ منطقه ایران و جهان می‌رسد."],
  ctaOrder: ["Order your kit", "سفارش کیت"],
  ctaDemo: ["See a sample report", "مشاهده گزارش نمونه"],
  stMembers: ["Members", "عضو"],
  stReports: ["Reports delivered", "گزارش تحویل‌شده"],
  stResearch: ["Research participants", "مشارکت در پژوهش"],
  stRegions: ["Ancestry regions", "منطقه تبارشناسی"],

  offTitle: ["Three ways to know yourself.", "سه راه برای شناخت خودتان."],
  offSub: ["One sample. A lifetime of discoveries.", "یک نمونه، یک عمر کشف."],
  o1t: ["Personal DNA report", "گزارش شخصی DNA"],
  o1d: ["Ancestry composition, haplogroups, traits and DNA relatives — in about three weeks.", "ترکیب تبار، هاپلوگروه، ویژگی‌ها و خویشاوندان ژنتیکی — حدود سه هفته بعد."],
  o1c: ["See sample report", "مشاهده گزارش نمونه"],
  o2t: ["Research with us", "پژوهش با ما"],
  o2d: ["Answer short surveys and help science discover what makes us different.", "به پرسش‌نامه‌های کوتاه پاسخ دهید و به علم کمک کنید تفاوت‌های ما را کشف کند."],
  o2c: ["Join research", "شرکت در پژوهش"],
  o3t: ["Open API", "API باز"],
  o3d: ["Build apps on top of genetic data — only with the user's explicit consent.", "روی داده ژنتیکی اپلیکیشن بسازید — فقط با اجازه صریح کاربر."],
  o3c: ["Read the docs", "مطالعه مستندات"],
  o4t: ["Raw data explorer", "کاوشگر داده خام"],
  o4d: ["Tested elsewhere? Upload your raw file and explore it instantly.", "قبلا جای دیگری آزمایش داده‌اید؟ فایل داده خام را بارگذاری کنید و همین حالا بررسی‌اش کنید."],
  o4c: ["Upload raw data", "بارگذاری داده خام"],

  howTitle: ["From saliva to story, in four steps.", "از بزاق تا داستان، در چهار قدم."],
  s1t: ["Order", "سفارش"], s1d: ["Your kit arrives at your door in 2–3 days.", "کیت ظرف ۲ تا ۳ روز به دستتان می‌رسد."],
  s2t: ["Spit", "نمونه‌گیری"], s2d: ["Fill the tube with saliva. No needles, two minutes.", "لوله را با بزاق پر کنید. بدون سوزن، در دو دقیقه."],
  s3t: ["Send", "ارسال"], s3d: ["Mail it back for free with the prepaid box.", "با جعبه پیش‌پرداخت، رایگان برگردانید."],
  s4t: ["Discover", "کشف"], s4d: ["Your report is ready in about three weeks.", "گزارش شما حدود سه هفته بعد آماده است."],

  priceTitle: ["Pick your kit.", "کیت خود را انتخاب کنید."],
  priceSub: ["Free shipping across Iran. Results for life.", "ارسال رایگان به سراسر ایران. نتایج برای همیشه."],
  popular: ["Most popular", "پرطرفدار"],
  toman: ["Toman", "تومان"],
  choose: ["Choose", "انتخاب"],

  privTitle: ["Your DNA. Your rules.", "DNA شما، قانون شما."],
  p1t: ["Private by design", "حریم خصوصی از پایه"], p1d: ["Samples are barcoded — never linked to your name in the lab.", "نمونه‌ها با بارکد شناخته می‌شوند و در آزمایشگاه هرگز به نام شما متصل نیستند."],
  p2t: ["You decide", "تصمیم با شماست"], p2d: ["Your data is never used for research without your consent.", "داده شما بدون رضایت‌تان هرگز در پژوهش استفاده نمی‌شود."],
  p3t: ["Delete anytime", "حذف در هر زمان"], p3d: ["Remove your data and sample with one tap.", "داده و نمونه‌تان را با یک لمس حذف کنید."],
  finalCta: ["Ready to meet yourself?", "آماده‌اید خودتان را بشناسید؟"],
  disclaimer: ["Risheh reports are informational and are not a medical diagnosis.", "گزارش‌های ریشه جنبه آگاهی‌بخشی دارند و تشخیص پزشکی نیستند."],

  orderTitle: ["Order your kit", "سفارش کیت"],
  orderSub: ["Free shipping across Iran.", "ارسال رایگان به سراسر ایران."],
  step1: ["Choose a kit", "انتخاب کیت"],
  step2: ["Shipping details", "اطلاعات ارسال"],
  fName: ["Full name", "نام و نام خانوادگی"],
  fPhone: ["Mobile number", "شماره موبایل"],
  fCity: ["City", "شهر"],
  fAddress: ["Address", "نشانی"],
  phoneHint: ["e.g. 09121234567", "مثال: ۰۹۱۲۱۲۳۴۵۶۷"],
  summary: ["Order summary", "خلاصه سفارش"],
  shipping: ["Shipping", "هزینه ارسال"],
  free: ["Free", "رایگان"],
  total: ["Amount payable", "مبلغ قابل پرداخت"],
  pay: ["Pay & place order", "پرداخت و ثبت سفارش"],
  payNote: ["Test payment — no money will be charged.", "پرداخت آزمایشی — مبلغی کسر نمی‌شود."],
  errEmpty: ["This field can't be empty", "اینجا نباید خالی باشد"],
  errPhone: ["Mobile number is not valid", "شماره موبایل نادرست است"],
  errAddress: ["Please write the full address", "لطفا نشانی کامل را بنویسید"],
  errGeneric: ["Something went wrong. Please try again.", "مشکلی پیش آمد. دوباره تلاش کنید."],
  processing: ["Processing…", "در حال پردازش…"],
  success: ["Your order is placed!", "سفارش شما ثبت شد!"],
  successSub: ["Keep this tracking code. Use it to follow your sample and open your report.", "این کد پیگیری را نگه دارید. با آن می‌توانید وضعیت نمونه را دنبال کنید و گزارشتان را ببینید."],
  copy: ["Copy", "کپی"],
  copied: ["Copied", "کپی شد"],
  track: ["Track my report", "پیگیری گزارش"],

  repTitle: ["My report", "گزارش من"],
  repSub: ["Enter your tracking code, or explore the sample report.", "کد پیگیری را وارد کنید یا گزارش نمونه را ببینید."],
  open: ["Open report", "مشاهده گزارش"],
  demo: ["Sample report", "گزارش نمونه"],
  notFound: ["No report found for this code.", "گزارشی با این کد پیدا نشد."],
  tabReport: ["DNA report", "گزارش DNA"],
  tabRaw: ["Raw data explorer", "کاوشگر داده خام"],
  ordered: ["Order placed", "ثبت سفارش"],
  shipped: ["Kit shipped", "ارسال کیت"],
  received: ["Sample received", "دریافت نمونه"],
  analyzing: ["Lab analysis", "تحلیل در آزمایشگاه"],
  ready: ["Report ready", "آماده شدن گزارش"],
  onTheWay: ["Your sample is on its way", "نمونه شما در مسیر است"],
  eta: ["Ready in about {n} seconds (demo speed).", "حدود {n} ثانیه دیگر آماده می‌شود (سرعت نمایشی)."],
  markers: ["markers analyzed", "نشانگر بررسی‌شده"],
  ancestry: ["Ancestry composition", "ترکیب تبار"],
  ancestrySub: ["Compared with reference populations across 40+ regions.", "مقایسه‌شده با جمعیت‌های مرجع در بیش از ۴۰ منطقه."],
  painting: ["Chromosome painting", "نقاشی کروموزومی"],
  paintingSub: ["Where each ancestry appears across your 23 chromosome pairs.", "هر تبار در کدام بخش از ۲۳ جفت کروموزوم شما دیده می‌شود."],
  haplo: ["Haplogroups", "هاپلوگروه‌ها"],
  maternal: ["Maternal line", "تبار مادری"],
  paternal: ["Paternal line", "تبار پدری"],
  neanderthal: ["Neanderthal DNA", "DNA نئاندرتال"],
  neanderthalSub: ["of your genome", "از ژنوم شما"],
  relatives: ["DNA relatives", "خویشاوندان ژنتیکی"],
  relativesSub: ["people share DNA with you", "نفر با شما DNA مشترک دارند"],
  cm: ["cM shared", "سانتی‌مورگان مشترک"],
  traits: ["Traits", "ویژگی‌ها"],
  genotype: ["Genotype", "ژنوتایپ"],
  notTested: ["Not tested", "بررسی نشده"],

  rawTitle: ["Explore your raw DNA", "داده خام DNA خود را کاوش کنید"],
  rawSub: ["Upload a raw data file (.txt or .zip) from Risheh, 23andMe or similar services. It's analyzed instantly and never stored.",
    "فایل داده خام (.txt یا .zip) ریشه، 23andMe یا سرویس‌های مشابه را بارگذاری کنید. فورا تحلیل می‌شود و هرگز ذخیره نمی‌شود."],
  drop: ["Drop your file here, or tap to choose", "فایل را اینجا رها کنید یا برای انتخاب لمس کنید"],
  trySample: ["Try with a sample file", "امتحان با فایل نمونه"],
  dlSample: ["Download sample", "دریافت فایل نمونه"],
  analyzingFile: ["Analyzing…", "در حال تحلیل…"],
  totalSnps: ["Total SNPs", "تعداد کل SNP"],
  callRate: ["Call rate", "نرخ خوانش"],
  het: ["Heterozygosity", "هتروزیگوسیتی"],
  build: ["Reference build", "نسخه مرجع"],
  perChrom: ["SNPs per chromosome", "تعداد SNP در هر کروموزوم"],
  unknown: ["Unknown", "نامشخص"],
  rawErr: ["We couldn't read this file.", "این فایل قابل خواندن نیست."],

  resTitle: ["Research with us.", "با ما پژوهش کنید."],
  resSub: ["Every answer helps scientists understand the genetics of Iranian populations. Anonymous, voluntary, and yours to withdraw.",
    "هر پاسخ به دانشمندان کمک می‌کند ژنتیک جمعیت‌های ایرانی را بهتر بشناسند. ناشناس، داوطلبانه و قابل انصراف."],
  minutes: ["min", "دقیقه"],
  participants: ["participants", "مشارکت‌کننده"],
  start: ["Start survey", "شروع پرسش‌نامه"],
  next: ["Next", "بعدی"],
  prev: ["Previous", "قبلی"],
  submit: ["Submit answers", "ثبت پاسخ‌ها"],
  thanks: ["Thank you! Here's how the community answered.", "ممنون! پاسخ بقیه اعضا این‌طور بوده است."],
  yourAnswer: ["Your answer", "پاسخ شما"],
  backSurveys: ["Back to surveys", "بازگشت به پرسش‌نامه‌ها"],
  qOf: ["Question {a} of {b}", "پرسش {a} از {b}"],

  devTitle: ["Build with genetics.", "با ژنتیک بسازید."],
  devSub: ["A simple REST API for ancestry, traits and research — powered by FastAPI, documented with OpenAPI.",
    "یک API ساده برای تبار، ویژگی‌ها و پژوهش — ساخته‌شده با FastAPI و همراه با مستندات OpenAPI."],
  openDocs: ["Open interactive docs", "مستندات تعاملی"],
  routes: ["API routes", "مسیرهای API"],
  quick: ["Quick start", "شروع سریع"],
  consent: ["Production access to a person's data always requires their explicit consent.", "دسترسی واقعی به داده هر فرد فقط با اجازه صریح خود او ممکن است."],
} satisfies Record<string, [string, string]>;

export type Key = keyof typeof S;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string; n: (x: number, d?: number) => string; pc: (x: number, d?: number) => string };
const I18n = createContext<Ctx>(null!);

export function I18nProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  const fmt = (x: number, d = 0) => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: d }).format(x);
  const pc = (x: number, d = 1) => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { style: "percent", maximumFractionDigits: d }).format(x / 100);
  const setLang = (l: Lang) => {
    document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = l;
    document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
    setLangState(l);
  };
  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s = S[k][lang === "fa" ? 1 : 0];
    for (const [v, x] of Object.entries(vars ?? {})) s = s.replace(`{${v}}`, typeof x === "number" ? fmt(x) : x);
    return s;
  };

  useEffect(() => {
    // card spotlight follows the pointer
    const move = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.(".spot") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);

  return <I18n.Provider value={{ lang, setLang, t, n: fmt, pc }}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);

/** Localized field from API objects shaped like {en, fa}. */
export const pick = <T,>(o: { en: T; fa: T }, lang: Lang) => o[lang];

/** Persian/Arabic digits → latin, for inputs like phone numbers. */
export const latinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
