"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = { name: string; status: "ok" | "error"; message?: string };

export default function DebugPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnostics() {
      try {
        const res = await fetch("/api/debug", { credentials: "include" });
        const data = await res.json();
        setSteps(data.steps ?? []);
        if (!res.ok) setFetchError(`HTTP ${res.status}`);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a0f0f] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Visor de errores / Diagnóstico</h1>
        <p className="text-drawsports-text-muted text-sm mb-6">
          Ejecuta en el servidor las mismas operaciones que el dashboard (cookies, auth, RLS).
        </p>

        {fetchError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
            Error al llamar /api/debug: {fetchError}
          </div>
        )}

        {loading ? (
          <p className="text-drawsports-text-muted">Ejecutando diagnóstico en servidor…</p>
        ) : (
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  s.status === "ok" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${s.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-medium text-white">{s.name}</span>
                </div>
                {s.message && (
                  <p className="mt-2 text-sm text-drawsports-text-muted font-mono break-all">
                    {s.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href="/es/dashboard"
            className="px-4 py-2 rounded-[50px] bg-drawsports-primary text-white font-medium"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/es/login"
            className="px-4 py-2 rounded-[50px] border border-white/20 text-drawsports-text-muted hover:text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  );
}
