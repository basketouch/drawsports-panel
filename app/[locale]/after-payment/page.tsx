"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { translations, type Locale } from "@/lib/translations";
import { CheckCircle, Mail } from "lucide-react";

export default function AfterPaymentPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "es";
  const t = translations[locale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] px-4">
      <a href={locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/"} className="mb-8 block text-center">
        <Image
          src="/imagenes/logo.png"
          alt="DrawSports"
          width={80}
          height={80}
          className="rounded-[22%] shadow-drawsports-card mx-auto"
        />
        <span className="block mt-2 text-xl font-bold text-drawsports-primary tracking-[0.2em]">
          DrawSports
        </span>
      </a>
      <div className="w-full max-w-md">
        <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t["afterPayment.title"]}
          </h1>
          <p className="text-drawsports-text-muted mb-4">
            {t["afterPayment.subtitle"]}
          </p>
          <div className="flex items-center justify-center gap-2 text-drawsports-text-muted text-sm mb-6">
            <Mail className="w-5 h-5" />
            <span>{t["afterPayment.checkEmail"]}</span>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-drawsports-text-muted text-sm mb-3">
              {t["afterPayment.alreadyActive"]}
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-block w-full py-4 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,23,68,0.5)] transition-all duration-200 text-center"
            >
              {t["afterPayment.login"]}
            </Link>
            <p className="text-drawsports-text-muted text-xs mt-3">
              {t["afterPayment.loginHint"]}
            </p>
          </div>
        </div>
        <p className="mt-6 text-center">
          <a
            href={locale === "en" ? "https://drawsports.app/pro/en/" : "https://drawsports.app/pro/"}
            className="text-drawsports-text-muted hover:text-white transition-colors text-sm"
          >
            ← {t.back}
          </a>
        </p>
      </div>
    </div>
  );
}
