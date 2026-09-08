"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { type Locale } from "@/lib/translations";

/**
 * Abre el portal de cliente de Paddle: facturas, cambiar tarjeta y cancelar.
 *
 * La sesión la crea la Edge Function `paddle-portal-session`, que comprueba
 * que el email tenga alguna licencia antes de pedirla a Paddle. Aquí no hay
 * secretos: solo la clave publicable, la misma que ya usa el resto del panel.
 */
export function ManageSubscription({
  email,
  locale,
}: {
  email: string;
  locale: Locale;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t =
    locale === "en"
      ? {
          boton: "Manage subscription",
          abriendo: "Opening…",
          ayuda: "Invoices, payment method and cancellation, in Paddle.",
          sinCompra:
            "We can't find a purchase with this email. If you bought on the App Store, manage it from your Apple account.",
          fallo: "Could not open the portal. Try again in a moment.",
        }
      : {
          boton: "Gestionar suscripción",
          abriendo: "Abriendo…",
          ayuda: "Facturas, método de pago y cancelación, en Paddle.",
          sinCompra:
            "No encontramos ninguna compra con este email. Si compraste en la App Store, gestiónala desde tu cuenta de Apple.",
          fallo: "No se pudo abrir el portal. Inténtalo de nuevo en un momento.",
        };

  async function abrirPortal() {
    setError(null);
    setCargando(true);
    try {
      const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
      const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
      const respuesta = await fetch(`${base}/functions/v1/paddle-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: clave,
          Authorization: `Bearer ${clave}`,
        },
        body: JSON.stringify({ email }),
      });
      const datos = await respuesta.json().catch(() => null);

      if (respuesta.status === 403) {
        setError(t.sinCompra);
        return;
      }
      if (!respuesta.ok || !datos?.url) {
        setError(t.fallo);
        return;
      }
      window.open(datos.url, "_blank", "noopener,noreferrer");
    } catch {
      setError(t.fallo);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <button
        onClick={abrirPortal}
        disabled={cargando}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-btn border border-white/20 text-drawsports-text-muted font-medium hover:border-drawsports-primary hover:text-white hover:shadow-drawsports-glow disabled:opacity-50 transition-all duration-200"
      >
        <CreditCard className="w-4 h-4" />
        {cargando ? t.abriendo : t.boton}
      </button>
      <p className="text-drawsports-text-muted text-xs mt-2">{t.ayuda}</p>
      {error && <p className="text-drawsports-primary text-sm mt-2">{error}</p>}
    </div>
  );
}
