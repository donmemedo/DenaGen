"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";

export default function Footer() {
  const { t, n } = useI18n();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-semibold text-fg"><Logo className="size-6" /> {t("brand")}</div>
        <p className="max-w-md">{t("disclaimer")}</p>
        <div className="flex gap-4 sm:ms-auto">
          <Link href="/research" className="hover:text-fg">{t("navResearch")}</Link>
          <Link href="/developers" className="hover:text-fg">{t("navDev")}</Link>
          <span>© {n(2026).replace(/[,٬]/g, "")}</span>
        </div>
      </div>
    </footer>
  );
}
