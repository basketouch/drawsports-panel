"use client";

import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import type { PublicLocale } from "@/lib/public-locale";

export function PublicPageShell({
  locale,
  children,
}: {
  locale: PublicLocale;
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
