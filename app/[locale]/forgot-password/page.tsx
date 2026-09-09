"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { translations, type Locale } from "@/lib/translations";
import { PublicPageShell } from "@/components/PublicPageShell";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = ((params?.locale as Locale) || "es") === "en" ? "en" : "es";
  const t = translations[locale];

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-drawsports-bg-dark border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all";
  const buttonClass =
    "w-full py-4 rounded-btn bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:shadow-drawsports-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : "https://panel.drawsports.app"}/auth/verify?next=/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  return (
    <PublicPageShell locale={locale}>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
            {success ? (
              <div className="text-center">
                <h1 className="text-xl font-bold text-white mb-2">{t["forgot.successTitle"]}</h1>
                <p className="text-drawsports-text-muted text-sm mb-6">
                  {t["forgot.successText"]} <strong className="text-white">{email}</strong>
                </p>
                <Link href={`/${locale}/login`} className={`inline-block px-6 ${buttonClass}`}>
                  {t["login.btn"]}
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white text-center mb-2">{t["forgot.title"]}</h1>
                <p className="text-drawsports-text-muted text-sm text-center mb-6">
                  {t["forgot.subtitle"]}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-drawsports-text-muted mb-1"
                    >
                      {t["login.email"]}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={inputClass}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {error && <p className="text-drawsports-primary text-sm font-medium">{error}</p>}
                  <button type="submit" disabled={loading} className={buttonClass}>
                    {loading ? t["forgot.sending"] : t["forgot.submit"]}
                  </button>
                </form>
                <p className="mt-4 text-center text-drawsports-text-muted text-sm">
                  <Link href={`/${locale}/login`} className="text-drawsports-primary hover:underline">
                    ← {t["login.btn"]}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
