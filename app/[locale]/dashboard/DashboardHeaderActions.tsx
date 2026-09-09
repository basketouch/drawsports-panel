"use client";

import { Suspense } from "react";
import { LangSwitch } from "@/components/LangSwitch";

export function DashboardHeaderActions({ locale }: { locale: "es" | "en" }) {
  return (
    <Suspense fallback={null}>
      <LangSwitch locale={locale} />
    </Suspense>
  );
}
