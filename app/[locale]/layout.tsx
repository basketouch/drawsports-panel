import { notFound } from "next/navigation";
import { type Locale } from "@/lib/translations";
import { LanguageSelector } from "@/components/LanguageSelector";

const locales: Locale[] = ["es", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
