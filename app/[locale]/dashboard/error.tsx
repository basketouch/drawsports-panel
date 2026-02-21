"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard] Error:", error.message, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Error al cargar el panel</h1>
      <p className="text-drawsports-text-muted text-center max-w-md mb-6">
        Ha ocurrido un error. Por favor, recarga la página o intenta más tarde.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:opacity-90 transition-opacity"
      >
        Reintentar
      </button>
    </div>
  );
}
