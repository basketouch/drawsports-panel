"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { translations, type Locale } from "@/lib/translations";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "es";
  const t = translations[locale];

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : "https://panel.drawsports.app"}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] px-4">
        <a href={locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/"} className="mb-8 block">
          <Image src="/imagenes/logo.png" alt="DrawSports" width={80} height={80} className="rounded-[22%] shadow-drawsports-card" />
        </a>
        <div className="w-full max-w-md text-center">
          <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
            <h1 className="text-xl font-bold text-white mb-2">{t["forgot.successTitle"]}</h1>
            <p className="text-drawsports-text-muted text-sm mb-6">
              {t["forgot.successText"]} <strong className="text-white">{email}</strong>
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-block px-6 py-2 rounded-[50px] bg-drawsports-primary text-white text-sm font-medium hover:shadow-drawsports-glow"
            >
              {t["login.btn"]}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] px-4">
      <a href={locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/"} className="mb-8 block">
        <Image src="/imagenes/logo.png" alt="DrawSports" width={80} height={80} className="rounded-[22%] shadow-drawsports-card" />
      </a>
      <div className="w-full max-w-md">
        <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
          <h1 className="text-2xl font-bold text-white text-center mb-2">{t["forgot.title"]}</h1>
          <p className="text-drawsports-text-muted text-sm text-center mb-6">{t["forgot.subtitle"]}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-drawsports-text-muted mb-1">
                {t["login.email"]}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary"
                placeholder="tu@email.com"
              />
            </div>
            {error && <p className="text-drawsports-primary text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              {loading ? t["forgot.sending"] : t["forgot.submit"]}
            </button>
          </form>
          <p className="mt-4 text-center text-drawsports-text-muted text-sm">
            <Link href={`/${locale}/login`} className="text-drawsports-primary hover:underline">
              ← {t["login.btn"]}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
