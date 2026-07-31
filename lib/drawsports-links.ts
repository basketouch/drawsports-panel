/** URL pública de la landing PRO en drawsports.app (solo ES/EN). */
export function getDrawSportsProHomeHref(locale: string): string {
  return locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/";
}
