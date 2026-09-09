"use client";

import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Locale = "es" | "en";

export function PublicPageShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="site-header min-h-[72px]" aria-hidden />}>
        <SiteHeader locale={locale} />
      </Suspense>
      {children}
      <SiteFooter locale={locale} />
    </div>
  );
}
