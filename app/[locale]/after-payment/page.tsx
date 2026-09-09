"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { translations, type Locale } from "@/lib/translations";
import { CheckCircle, Mail } from "lucide-react";
import { PublicPageShell } from "@/components/PublicPageShell";

export default function AfterPaymentPage() {
  const params = useParams();
  const locale = ((params?.locale as Locale) || "es") === "en" ? "en" : "es";
  const t = translations[locale];

  const buttonClass =
    "inline-block w-full py-4 rounded-btn bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:shadow-drawsports-glow transition-all duration-200 text-center";

  return (
    <PublicPageShell locale={locale}>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t["afterPayment.title"]}</h1>
            <p className="text-drawsports-text-muted mb-4">{t["afterPayment.subtitle"]}</p>
            <div className="flex items-center justify-center gap-2 text-drawsports-text-muted text-sm mb-6">
              <Mail className="w-5 h-5" />
              <span>{t["afterPayment.checkEmail"]}</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-drawsports-text-muted text-sm mb-3">{t["afterPayment.alreadyActive"]}</p>
              <Link href={`/${locale}/login`} className={buttonClass}>
                {t["afterPayment.login"]}
              </Link>
              <p className="text-drawsports-text-muted text-xs mt-3">{t["afterPayment.loginHint"]}</p>
            </div>
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
