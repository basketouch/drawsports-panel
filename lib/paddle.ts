/**
 * Compra de DrawSports PRO vía Paddle.
 *
 * El checkout Paddle (Paddle.js + price IDs + webhook → Supabase) vive en
 * cutsports.app/pricing, que es el único sitio con Paddle.js configurado.
 * Desde el panel enlazamos allí con el email del usuario para que el pago
 * quede vinculado a esta misma cuenta (profiles.email == email Paddle).
 *
 * Planes:
 *  - pack: CutSports Pro (Mac) + DrawSports PRO (iPad, 1 usuario) — 250 €/año
 *  - pro:  solo CutSports Pro (Mac) — 199 €/año, 30 días de prueba
 */
const PRICING_BASE = "https://cutsports.app/pricing/";

export type PaddlePlan = "pack" | "pro";

/**
 * Planes que se ofrecen en el panel.
 *
 * Solo el pack. CutSports Pro suelto se quitó a propósito: estas tarjetas solo
 * las ve quien no tiene suscripción activa, alguien que llegó por el iPad, y
 * ofrecerle software solo para Mac es lo menos relevante de la pantalla. Además,
 * 199 € al lado de 250 € hacía que el pack compitiera contra sí mismo, cuando es
 * la vía natural para pasar al Mac y ya lleva CutSports Pro dentro.
 *
 * `getPaddleCheckoutUrl` sigue aceptando "pro" por si algún día se enlaza desde
 * otro sitio.
 */
export const PADDLE_PLANS: ReadonlyArray<{
  plan: PaddlePlan;
  labelKey: "dashboard.paddle.pack" | "dashboard.paddle.pro";
  descKey: "dashboard.paddle.packDesc" | "dashboard.paddle.proDesc";
  price: string;
}> = [
  { plan: "pack", labelKey: "dashboard.paddle.pack", descKey: "dashboard.paddle.packDesc", price: "250€" },
];

export function getPaddleCheckoutUrl(plan: PaddlePlan, email: string, locale: string): string {
  const base = locale === "es" ? PRICING_BASE : `https://cutsports.app/en/pricing/`;
  const params = new URLSearchParams({ plan, email });
  return `${base}?${params.toString()}`;
}
