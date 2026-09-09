"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import { translations, type Locale } from "@/lib/translations";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Acceso sin contraseña: escribes tu email y entras con un código de un solo uso.
 *
 * Mismo email que en CutSports y en la app de iPad. El código verifica que la
 * cuenta es tuya, que aquí hace falta porque el panel gestiona el equipo, las
 * plazas y la suscripción.
 *
 * `shouldCreateUser: false` es deliberado: el panel no da de alta a nadie. La
 * cuenta la crea la compra (webhook de Paddle) o una invitación del propietario.
 */
const CODE_MIN = 6;
const CODE_MAX = 10;
const RESEND_SECONDS = 60;

function LoginForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as Locale) || "es";
  const t = translations[locale];

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const emailParam = (searchParams.get("email") || "").trim().toLowerCase();
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("success") === "password_created") {
      setSuccessMessage(t["login.passwordCreated"]);
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  function describeError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("signups not allowed") || m.includes("user not found")) {
      return t["login.error.noAccount"];
    }
    if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
      return t["login.error.tooMany"];
    }
    if (m.includes("expired") || m.includes("invalid")) {
      return t["login.error.badCode"];
    }
    return message;
  }

  async function sendCode(targetEmail: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(describeError(error.message));
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await sendCode(email.trim().toLowerCase());
      setStep("code");
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setError(describeError(error.message));
      setLoading(false);
      return;
    }

    window.location.href = `/${locale}/dashboard`;
  }

  async function handleResend() {
    if (secondsLeft > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      await sendCode(email.trim().toLowerCase());
      setSecondsLeft(RESEND_SECONDS);
      setSuccessMessage(t["login.codeResent"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-drawsports-bg-dark border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all";
  const buttonClass =
    "w-full py-4 rounded-btn bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:shadow-drawsports-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200";

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
          <h1 className="text-2xl font-bold text-white text-center mb-2">{t["login.title"]}</h1>
          <p className="text-drawsports-text-muted text-center text-sm mb-6">
            {step === "email" ? t["login.subtitleCode"] : t["login.codeSubtitle"]}
          </p>

          {successMessage && (
            <p className="text-green-400 text-sm text-center mb-4 bg-green-500/10 py-3 px-4 rounded-xl">
              {successMessage}
            </p>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                {loading ? t["login.sending"] : t["login.sendCode"]}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <p className="text-drawsports-text-muted text-sm text-center">
                {t["login.codeSentTo"]} <span className="text-white font-medium">{email}</span>
              </p>
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-drawsports-text-muted mb-1"
                >
                  {t["login.code"]}
                </label>
                <input
                  id="code"
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={CODE_MAX}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className={`${inputClass} text-center tracking-[0.35em] text-xl font-semibold`}
                  placeholder="00000000"
                />
              </div>
              {error && <p className="text-drawsports-primary text-sm font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length < CODE_MIN}
                className={buttonClass}
              >
                {loading ? t["login.submitting"] : t["login.submit"]}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                  }}
                  className="text-drawsports-text-muted hover:text-white transition-colors"
                >
                  {t["login.changeEmail"]}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || loading}
                  className="text-drawsports-primary hover:underline disabled:text-drawsports-text-muted disabled:no-underline disabled:cursor-not-allowed"
                >
                  {secondsLeft > 0
                    ? `${t["login.resendIn"]} ${secondsLeft}s`
                    : t["login.resend"]}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-drawsports-text-muted text-xs leading-relaxed">
            {t["login.noPasswordHint"]} {t["login.ipadHint"]}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  const params = useParams();
  const locale = ((params?.locale as Locale) || "es") === "en" ? "en" : "es";

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="site-header min-h-[72px]" aria-hidden />}>
        <SiteHeader locale={locale} />
      </Suspense>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <SiteFooter locale={locale} />
    </div>
  );
}
