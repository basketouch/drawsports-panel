/** Home pública de drawsports.app (misma que la web). */
export function getDrawSportsHomeHref(locale: string): string {
  return locale === "en" ? "https://drawsports.app/en/" : "https://drawsports.app/";
}

/** URL pública de la landing PRO en drawsports.app (solo ES/EN). */
export function getDrawSportsProHomeHref(locale: string): string {
  return locale === "en" ? "https://drawsports.app/pro/planes/en/" : "https://drawsports.app/pro/planes/";
}

/** Página de planes PRO donde se compra DrawSports suelto (checkout Paddle). */
export function getDrawSportsPlansHref(locale: string, email?: string): string {
  const hash = locale === "en" ? "#plans" : "#planes";
  const base =
    locale === "en"
      ? "https://drawsports.app/pro/planes/en/"
      : "https://drawsports.app/pro/planes/";
  if (email) return `${base}?email=${encodeURIComponent(email)}${hash}`;
  return `${base}${hash}`;
}
