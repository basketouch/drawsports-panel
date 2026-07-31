"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FLAGS = [
  { locale: "es", flag: "🇪🇸", title: "Español", hrefPrefix: "/es" },
  { locale: "en", flag: "🇺🇸", title: "English", hrefPrefix: "/en" },
] as const;

const btnClass =
  "inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[1.3rem] sm:text-[1.5rem] transition-all duration-300 no-underline";
const btnActive = "bg-drawsports-primary/20 border-2 border-drawsports-primary";
const btnInactive =
  "bg-drawsports-bg-card border-2 border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:border-drawsports-primary hover:shadow-drawsports-glow";

export function LanguageSelector() {
  const pathname = usePathname();
  const pathWithoutLocale = pathname?.replace(/^\/(es|en)/, "") || "";
  const currentLocale = pathname?.startsWith("/en") ? "en" : "es";

  const getHref = (locale: string) =>
    pathWithoutLocale ? `/${locale}${pathWithoutLocale}` : `/${locale}/login`;

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-[1000] flex gap-2.5">
      {FLAGS.map(({ locale, flag, title }) => (
        <Link
          key={locale}
          href={getHref(locale)}
          title={title}
          className={`${btnClass} ${currentLocale === locale ? btnActive : btnInactive}`}
        >
          {flag}
        </Link>
      ))}
    </div>
  );
}
