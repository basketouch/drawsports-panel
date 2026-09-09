import { getDrawSportsHomeHref } from "@/lib/drawsports-links";

import type { PublicLocale } from "@/lib/public-locale";

const copy = {
  es: {
    home: "Inicio",
    panel: "Panel",
    terms: "Términos",
    privacy: "Privacidad",
    refunds: "Reembolsos",
    support: "Soporte",
  },
  en: {
    home: "Home",
    panel: "Panel",
    terms: "Terms",
    privacy: "Privacy",
    refunds: "Refunds",
    support: "Support",
  },
} as const;

export function SiteFooter({ locale }: { locale: PublicLocale }) {
  const t = copy[locale];
  const home = getDrawSportsHomeHref(locale);
  const terms =
    locale === "en"
      ? "https://drawsports.app/en/legal/terms/"
      : "https://drawsports.app/legal/terminos/";
  const privacy =
    locale === "en"
      ? "https://drawsports.app/en/legal/privacy/"
      : "https://drawsports.app/legal/privacidad/";
  const refunds =
    locale === "en"
      ? "https://drawsports.app/en/legal/refunds/"
      : "https://drawsports.app/legal/reembolsos/";

  return (
    <footer className="site-footer">
      <div className="site-container">
        <p>© 2026 DrawSports · Basketouch Solutions Spain SL</p>
        <div className="site-footer-links">
          <a href={home}>{t.home}</a>
          <a href={`https://panel.drawsports.app/${locale}`}>{t.panel}</a>
          <a href={terms}>{t.terms}</a>
          <a href={privacy}>{t.privacy}</a>
          <a href={refunds}>{t.refunds}</a>
          <a href="mailto:help@basketouch.com">{t.support}</a>
        </div>
      </div>
    </footer>
  );
}
