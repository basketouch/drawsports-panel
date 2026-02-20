"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Users } from "lucide-react";
import type { Locale } from "@/lib/translations";

const DEFAULT_ORG_NAME = "Mi equipo";

export function SetupTeamName({
  orgId,
  locale,
  t,
}: {
  orgId: string;
  locale: Locale;
  t: Record<string, string>;
}) {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = teamName.trim();
    if (!name || name.length < 2) {
      setError(locale === "es" ? "El nombre debe tener al menos 2 caracteres" : "Name must be at least 2 characters");
      return;
    }
    if (name.length > 100) {
      setError(locale === "es" ? "Máximo 100 caracteres" : "Maximum 100 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!session?.access_token || !supabaseUrl) {
      setError(locale === "es" ? "Sesión expirada" : "Session expired");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/update-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ org_id: orgId, action: "update", name }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      setLoading(false);
      if (res.ok && result?.success) {
        router.refresh();
      } else {
        setError(result?.error || (locale === "es" ? "Error al guardar" : "Error saving"));
      }
    } catch {
      setLoading(false);
      setError(locale === "es" ? "Error inesperado" : "Unexpected error");
    }
  }

  return (
    <div className="mb-8">
      <div className="bg-drawsports-bg-card rounded-2xl border-2 border-drawsports-primary/30 shadow-drawsports-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-drawsports-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-drawsports-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t["setup.teamName.title"]}</h2>
            <p className="text-drawsports-text-muted text-sm">{t["setup.teamName.subtitle"]}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={t["setup.teamName.placeholder"]}
            required
            minLength={2}
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all"
            autoFocus
          />
          {error && (
            <p className="text-drawsports-primary text-sm font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,23,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
          >
            {loading ? t["setup.teamName.saving"] : t["setup.teamName.submit"]}
          </button>
        </form>
      </div>
    </div>
  );
}

export function needsTeamSetup(orgName: string | null): boolean {
  return orgName === DEFAULT_ORG_NAME;
}
