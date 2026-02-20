"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/es/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0f0f] px-4">
      <div className="w-full max-w-md">
        <div className="bg-drawsports-bg-card rounded-2xl p-8 border border-white/5 shadow-drawsports-card">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Create your password
          </h1>
          <p className="text-drawsports-text-muted text-sm text-center mb-6">
            Enter your new password to access the panel.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-drawsports-text-muted mb-1">
                New password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary"
                ariaLabelShow="Show password"
                ariaLabelHide="Hide password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-drawsports-text-muted mb-1">
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repeat password"
                className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary"
                ariaLabelShow="Show password"
                ariaLabelHide="Hide password"
              />
            </div>
            {error && <p className="text-drawsports-primary text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
          <p className="mt-4 text-center text-drawsports-text-muted text-sm">
            <Link href="/es/login" className="text-drawsports-primary hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
