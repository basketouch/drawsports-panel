"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOCALES = [
  { locale: "es", label: "ES", title: "Español" },
  { locale: "en", label: "EN", title: "English" },
] as const;

const btnClass =
  "inline-flex items-center justify-center min-w-9 h-9 sm:min-w-10 sm:h-10 px-2.5 rounded-[10px] text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 no-underline";
const btnActive = "bg-drawsports-primary/20 border-2 border-drawsports-primary text-white";
const btnInactive =
  "bg-drawsports-bg-card border-2 border-white/20 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:border-drawsports-primary hover:shadow-drawsports-glow";

export function LanguageSelector() {
  const pathname = usePathname();
  const pathWithoutLocale = pathname?.replace(/^\/(es|en)/, "") || "";
  const currentLocale = pathname?.startsWith("/en") ? "en" : "es";

  const getHref = (locale: string) =>
    pathWithoutLocale ? `/${locale}${pathWithoutLocale}` : `/${locale}/login`;

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-[1000] flex gap-2.5">
      {LOCALES.map(({ locale, label, title }) => (
        <Link
          key={locale}
          href={getHref(locale)}
          title={title}
          hrefLang={locale}
          lang={locale}
          className={`${btnClass} ${currentLocale === locale ? btnActive : btnInactive}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
