"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/translations";

type Props = { locale: Locale; label: string };

export function SyncLicenseButton({ locale, label }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-drawsports-primary/50 text-drawsports-primary text-sm font-medium hover:bg-drawsports-primary/10 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      {label}
    </button>
  );
}
