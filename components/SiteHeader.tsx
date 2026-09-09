"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getDrawSportsHomeHref, getDrawSportsPlansHref } from "@/lib/drawsports-links";
import { LangSwitch } from "@/components/LangSwitch";

type Locale = "es" | "en";

const copy = {
  es: {
    plans: "Planes PRO",
    signIn: "Acceder",
    support: "Soporte",
  },
  en: {
    plans: "PRO plans",
    signIn: "Sign in",
    support: "Support",
  },
} as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = copy[locale];
  const isLogin = pathname?.includes("/login");

  return (
    <header className="site-header">
      <div className="site-container-wide">
        <Link href={getDrawSportsHomeHref(locale)} className="site-brand">
          <Image
            src="/imagenes/logo-header.webp"
            alt=""
            width={40}
            height={40}
            className="site-brand-logo"
            priority
          />
          <span>DrawSports</span>
        </Link>
        <nav className="site-nav" aria-label={locale === "en" ? "Main" : "Principal"}>
          <a href={getDrawSportsPlansHref(locale)}>{t.plans}</a>
          <LangSwitch locale={locale} />
          <Link href={`/${locale}/login`} className={isLogin ? "is-active" : undefined}>
            {t.signIn}
          </Link>
          <a href="mailto:help@basketouch.com">{t.support}</a>
        </nav>
      </div>
    </header>
  );
}
