/** Idiomas públicos del panel (alineados con drawsports.app). */
export type PublicLocale = "es" | "en";

export function toPublicLocale(locale: string): PublicLocale {
  return locale === "en" ? "en" : "es";
}
