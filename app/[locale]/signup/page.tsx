"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "@/lib/translations";

export default function SignupPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "es";
  const t = translations[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/${locale}/dashboard` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] px-4">
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-drawsports-text-muted mb-1"
              >
                {t["signup.passwordConfirm"]}
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all"
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
