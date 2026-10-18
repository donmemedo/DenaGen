import type { Metadata, Viewport } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const vazir = Vazirmatn({ variable: "--font-vazir", subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Risheh · ریشه — Your story, written in your DNA",
  description: "Personal genomics for Iran: ancestry composition, haplogroups, traits, DNA relatives and research.",
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f5f7" }, { media: "(prefers-color-scheme: dark)", color: "#000000" }],
};

// runs before paint so there is no theme flash
const themeScript = `try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = (await cookies()).get("lang")?.value === "en" ? "en" : "fa";
  return (
    <html lang={lang} dir={lang === "fa" ? "rtl" : "ltr"} className={`${inter.variable} ${vazir.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <I18nProvider initial={lang}>
          <div aria-hidden className="aurora pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <span className="size-[55vw] -top-[20vw] -start-[10vw] bg-a1" />
            <span className="size-[45vw] top-[30vh] -end-[15vw] bg-a2 [animation-delay:-8s]" />
            <span className="size-[40vw] top-[90vh] start-[20vw] bg-a3 [animation-delay:-14s]" />
          </div>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
