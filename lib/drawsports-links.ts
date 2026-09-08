/** URL pública de la landing PRO en drawsports.app (solo ES/EN). */
export function getDrawSportsProHomeHref(locale: string): string {
  return locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/";
}

/** Página de planes PRO donde se compra DrawSports suelto (checkout Paddle). */
export function getDrawSportsPlansHref(locale: string, email?: string): string {
  const base =
    locale === "en"
      ? "https://drawsports.app/pro/planes/en/"
      : "https://drawsports.app/pro/planes/";
  return email ? `${base}?email=${encodeURIComponent(email)}` : base;
}
