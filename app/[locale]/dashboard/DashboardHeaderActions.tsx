"use client";

import { Suspense } from "react";
import { LangSwitch } from "@/components/LangSwitch";
import type { PublicLocale } from "@/lib/public-locale";

export function DashboardHeaderActions({ locale }: { locale: PublicLocale }) {
  return (
    <Suspense fallback={null}>
      <LangSwitch locale={locale} />
    </Suspense>
  );
}
