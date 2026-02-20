"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "@/lib/translations";
import { PasswordInput } from "@/components/PasswordInput";

export default function SignupPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "es";
  const t = translations[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError(locale === "es" ? "Las contraseñas no coinciden" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(locale === "es" ? "La contraseña debe tener al menos 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
        data: { preferred_team_name: teamName.trim() },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    setHasSession(!!data?.session);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] px-4">
      {success && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/10 shadow-drawsports-card max-w-md w-full text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t["signup.checkEmail"]}</h2>
            <p className="text-drawsports-text-muted text-sm mb-6">
              {t["signup.checkEmailText"]} <strong className="text-white">{email}</strong>
            </p>
            <p className="text-drawsports-text-muted text-xs mb-6">{t["signup.checkSpam"]}</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {hasSession ? (
                <Link href={`/${locale}/dashboard`} className="px-6 py-2 rounded-[50px] bg-drawsports-primary text-white text-sm font-medium hover:shadow-drawsports-glow">
                  {t["signup.goPanel"]}
                </Link>
              ) : (
                <Link href={`/${locale}/login`} className="px-6 py-2 rounded-[50px] bg-white/10 text-white text-sm font-medium hover:bg-white/20">
                  {t["signup.goLogin"]}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="px-6 py-2 rounded-[50px] border border-white/20 text-drawsports-text-muted text-sm font-medium hover:bg-white/5"
              >
                {t["signup.close"]}
              </button>
            </div>
          </div>
        </div>
      )}
      <Link href={`/${locale}`} className="mb-8">
        <Image
          src="/imagenes/logo.png"
          alt="DrawSports"
          width={80}
          height={80}
          className="rounded-[22%] shadow-drawsports-card"
        />
      </Link>
      <div className="w-full max-w-md">
        <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {t["signup.title"]}
          </h1>
          <p className="text-drawsports-text-muted text-center text-sm mb-6">
            {t["signup.subtitle"]}
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
                className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-drawsports-text-muted mb-1"
              >
                {t["login.password"]}
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                ariaLabelShow={locale === "es" ? "Mostrar contraseña" : "Show password"}
                ariaLabelHide={locale === "es" ? "Ocultar contraseña" : "Hide password"}
              />
            </div>
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-drawsports-text-muted mb-1"
              >
                {t["signup.passwordConfirm"]}
              </label>
              <PasswordInput
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
                ariaLabelShow={locale === "es" ? "Mostrar contraseña" : "Show password"}
                ariaLabelHide={locale === "es" ? "Ocultar contraseña" : "Hide password"}
              />
            </div>
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-drawsports-text-muted mb-1"
              >
                {t["signup.teamName"]}
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all"
                placeholder={t["signup.teamNamePlaceholder"]}
              />
            </div>
            {error && (
              <p className="text-drawsports-primary text-sm font-medium">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,23,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {loading ? t["signup.submitting"] : t["signup.submit"]}
            </button>
          </form>
          <p className="mt-5 text-center text-drawsports-text-muted text-sm">
            {t["login.hasAccount"]}{" "}
            <Link href={`/${locale}/login`} className="text-drawsports-primary hover:underline font-medium">
              {t["login.btn"]}
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="text-drawsports-text-muted hover:text-white transition-colors text-sm"
          >
            ← {t.back}
          </Link>
        </p>
      </div>
    </div>
  );
}
