"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSelector() {
  const pathname = usePathname();
  const pathWithoutLocale = pathname?.replace(/^\/(es|en)/, "") || "";
  const currentLocale = pathname?.startsWith("/en") ? "en" : "es";

  const esHref = pathWithoutLocale ? `/es${pathWithoutLocale}` : "/es/login";
  const enHref = pathWithoutLocale ? `/en${pathWithoutLocale}` : "/en/login";

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-[1000] flex gap-2.5">
      <Link
        href={esHref}
        title="Español"
        className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[1.3rem] sm:text-[1.5rem] transition-all duration-300 no-underline
          ${currentLocale === "es"
            ? "bg-drawsports-primary/20 border-2 border-drawsports-primary"
            : "bg-drawsports-bg-card border-2 border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-drawsports-primary hover:shadow-[0_6px_15px_rgba(255,23,68,0.4)]"
          }`}
      >
        🇪🇸
      </Link>
      <Link
        href={enHref}
        title="English"
        className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[1.3rem] sm:text-[1.5rem] transition-all duration-300 no-underline
          ${currentLocale === "en"
            ? "bg-drawsports-primary/20 border-2 border-drawsports-primary"
            : "bg-drawsports-bg-card border-2 border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-drawsports-primary hover:shadow-[0_6px_15px_rgba(255,23,68,0.4)]"
          }`}
      >
        🇺🇸
      </Link>
    </div>
  );
}
