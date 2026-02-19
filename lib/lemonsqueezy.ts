const LEMON_SQUEEZY_STORE = "drawsports.lemonsqueezy.com";

export const LEMON_SQUEEZY_VARIANTS = [
  { checkoutId: "20b3dbf7-1e21-482c-8d0b-4faa63033097", users: 3 },
  { checkoutId: "13aa906b-7bfa-4c4a-ad15-f8802bd56691", users: 5 },
  { checkoutId: "1e8a160e-d39e-424a-819c-bce00a7aee85", users: 10 },
] as const;

export function getCheckoutUrl(checkoutId: string, email: string): string {
  const base = `https://${LEMON_SQUEEZY_STORE}/checkout/buy/${checkoutId}`;
  const params = new URLSearchParams({
    "checkout[custom][email]": email,
    discount: "0",
  });
  return `${base}?${params.toString()}`;
}
