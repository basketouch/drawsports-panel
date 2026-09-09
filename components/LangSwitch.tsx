"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const LOCALES = [
  { locale: "es", label: "ES", title: "Español" },
  { locale: "en", label: "EN", title: "English" },
] as const;

type Locale = (typeof LOCALES)[number]["locale"];

export function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathWithoutLocale = pathname?.replace(/^\/(es|en)/, "") || "/login";
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <span className="lang-switch" aria-label={locale === "en" ? "Language" : "Idioma"}>
      {LOCALES.map(({ locale: loc, label, title }) => (
        <Link
          key={loc}
          href={`/${loc}${pathWithoutLocale}${suffix}`}
          title={title}
          hrefLang={loc}
          lang={loc}
          className={locale === loc ? "is-active" : undefined}
        >
          {label}
        </Link>
      ))}
    </span>
  );
}
