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

export const PADDLE_PLANS: ReadonlyArray<{
  plan: PaddlePlan;
  labelKey: "dashboard.paddle.pack" | "dashboard.paddle.pro";
  descKey: "dashboard.paddle.packDesc" | "dashboard.paddle.proDesc";
  price: string;
}> = [
  { plan: "pack", labelKey: "dashboard.paddle.pack", descKey: "dashboard.paddle.packDesc", price: "250€" },
  { plan: "pro", labelKey: "dashboard.paddle.pro", descKey: "dashboard.paddle.proDesc", price: "199€" },
];

export function getPaddleCheckoutUrl(plan: PaddlePlan, email: string, locale: string): string {
  const base = locale === "es" ? PRICING_BASE : `https://cutsports.app/en/pricing/`;
  const params = new URLSearchParams({ plan, email });
  return `${base}?${params.toString()}`;
}
