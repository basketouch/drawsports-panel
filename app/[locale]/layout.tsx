import { notFound } from "next/navigation";
import { type Locale } from "@/lib/translations";
import { LanguageSelector } from "@/components/LanguageSelector";

const locales: Locale[] = ["es", "en"];

// Evitar pre-render estático que puede causar sesión vacía en dashboard
export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <>
      <LanguageSelector />
      {children}
    </>
  );
}
