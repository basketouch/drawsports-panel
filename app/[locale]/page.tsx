import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "@/lib/translations";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translations[locale as Locale];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a0f0f]">
      <header className="text-center pt-20 pb-10 px-4">
        <div className="w-[120px] h-[120px] mx-auto mb-4 rounded-[22%] overflow-hidden shadow-drawsports-card bg-drawsports-bg-card flex items-center justify-center">
          <Image
            src="/imagenes/logo.png"
            alt="DrawSports"
            width={120}
            height={120}
            className="object-cover"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-widest">
          DrawSports PRO
        </h1>
        <p className="text-drawsports-text-muted text-lg max-w-md mx-auto mb-10">
          {t["panel.subtitle"]}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center px-8 py-4 rounded-[50px] bg-drawsports-primary text-white font-bold text-lg shadow-drawsports-glow hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,23,68,0.5)] transition-all duration-200"
          >
            {t["login.btn"]}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center px-8 py-4 rounded-[50px] bg-white/10 text-white font-bold border border-white/20 hover:-translate-y-0.5 hover:border-drawsports-primary hover:shadow-drawsports-glow transition-all duration-200"
          >
            {t["signup.btn"]}
          </Link>
        </div>

        <div className="mt-12 flex justify-center gap-6 flex-wrap px-4">
          <Image
            src="/imagenes/imagen1.png"
            alt="DrawSports - Videoanálisis en iPad"
            width={450}
            height={334}
            className="rounded-xl shadow-drawsports-card object-contain max-h-[334px] w-auto"
          />
          <Image
            src="/imagenes/imagen2.png"
            alt="DrawSports - Pizarra táctica"
            width={450}
            height={334}
            className="rounded-xl shadow-drawsports-card object-contain max-h-[334px] w-auto"
          />
          <Image
            src="/imagenes/imagen3.png"
            alt="DrawSports - Análisis de video"
            width={450}
            height={334}
            className="rounded-xl shadow-drawsports-card object-contain max-h-[334px] w-auto"
          />
        </div>
      </header>

      <footer className="mt-auto py-12 text-center text-drawsports-text-muted text-sm border-t border-white/10">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
