"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FLAGS = [
  { locale: "es", flag: "🇪🇸", label: "Español", title: "Español" },
  { locale: "en", flag: "🇺🇸", label: "English", title: "English" },
  { locale: "zh", flag: "🇨🇳", label: "中文", title: "中文" },
  { locale: "ja", flag: "🇯🇵", label: "日本語", title: "日本語" },
] as const;

const btnClass =
  "inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[1.3rem] sm:text-[1.5rem] transition-all duration-300 no-underline";
const btnActive = "bg-drawsports-primary/20 border-2 border-drawsports-primary";
const btnInactive =
  "bg-drawsports-bg-card border-2 border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-drawsports-primary hover:shadow-[0_6px_15px_rgba(255,23,68,0.4)]";

export function LanguageSelector() {
  const pathname = usePathname();
  const pathWithoutLocale = pathname?.replace(/^\/(es|en|zh|ja)/, "") || "";
  const currentLocale = pathname?.startsWith("/en")
    ? "en"
    : pathname?.startsWith("/zh")
      ? "zh"
      : pathname?.startsWith("/ja")
        ? "ja"
        : "es";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  const getHref = (locale: string) =>
    pathWithoutLocale ? `/${locale}${pathWithoutLocale}` : `/${locale}/login`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentFlag = FLAGS.find((f) => f.locale === currentLocale)!;

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-[1000] flex gap-2.5">
      {/* Desktop: 4 flags */}
      <div className="hidden md:flex gap-2.5">
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

      {/* Mobile: bandera actual + globo + dropdown */}
      <div className="md:hidden flex gap-2 relative" ref={mobileRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="Idioma actual"
          aria-expanded={dropdownOpen}
          className={`${btnClass} ${btnActive}`}
        >
          {currentFlag.flag}
        </button>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="Cambiar idioma"
          aria-expanded={dropdownOpen}
          className={`${btnClass} ${btnInactive}`}
        >
          🌐
        </button>
        {dropdownOpen && (
          <div
            className="absolute top-full right-0 mt-2 py-2 px-2 min-w-[120px] bg-drawsports-bg-card border-2 border-white/20 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col gap-1 z-[1001]"
            role="menu"
          >
            {FLAGS.map(({ locale, flag, label, title }) => (
              <Link
                key={locale}
                href={getHref(locale)}
                title={title}
                role="menuitem"
                className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-white no-underline text-base hover:bg-drawsports-primary/20 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                {flag} {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
