"use client";

import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/translations";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = {
    es: "Cerrar sesión",
    en: "Sign out",
  }[locale];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-white/20 text-drawsports-text-muted font-medium hover:border-drawsports-primary hover:text-white hover:shadow-drawsports-glow hover:-translate-y-0.5 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      {t}
    </button>
  );
}
