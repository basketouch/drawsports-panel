"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0f0f] p-8">
      <h1 className="text-2xl font-bold text-white mb-4">
        Algo ha ido mal
      </h1>
      <p className="text-drawsports-text-muted text-center max-w-md mb-6">
        Ha ocurrido un error al cargar la página. Por favor, inténtalo de nuevo.
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
