"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const next = searchParams.get("next") ?? "/update-password";

  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async () => {
      const hash = window.location.hash;
      const code = searchParams.get("code");

      if (hash) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            window.history.replaceState(null, "", window.location.pathname + "?next=" + next);
            router.replace(next);
            return;
          }
        }
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(next);
        return;
      }

      setStatus("error");
    };

    handleAuth();
  }, [router, next, searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0f0f] px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
            <h1 className="text-xl font-bold text-white mb-2">Invalid or expired link</h1>
            <p className="text-drawsports-text-muted text-sm mb-6">
              This link may have expired or already been used. Request a new invitation or try again.
            </p>
            <Link
              href="/es/login"
              className="inline-block px-6 py-2 rounded-[50px] bg-drawsports-primary text-white text-sm font-medium hover:shadow-drawsports-glow"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0f0f] px-4">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-drawsports-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-drawsports-text-muted">Setting up your account…</p>
      </div>
    </div>
  );
}

function AuthVerifyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0f0f] px-4">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-drawsports-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-drawsports-text-muted">Loading…</p>
      </div>
    </div>
  );
}

export default function AuthVerifyPage() {
  return (
    <Suspense fallback={<AuthVerifyFallback />}>
      <AuthVerifyContent />
    </Suspense>
  );
}
