"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { Users } from "lucide-react";
import type { Locale } from "@/lib/translations";

type Member = { email: string; organization_role: string };

export function ManageTeam({
  orgId,
  seatsLimit,
  members,
  locale,
  t,
}: {
  orgId: string;
  seatsLimit: number;
  members: Member[];
  locale: Locale;
  t: Record<string, string>;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const slotsLeft = seatsLimit - members.length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("invite-org-member", {
      body: { org_id: orgId, email: trimmed },
    });

    setLoading(false);
    setEmail("");

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    const result = data as { success: boolean; error?: string; invited?: boolean };
    if (result.success) {
      const msg = result.invited ? t["dashboard.manageTeam.inviteSent"] : (locale === "es" ? "Miembro añadido correctamente" : "Member added successfully");
      setMessage({ type: "success", text: msg });
      window.location.reload();
    } else {
      setMessage({ type: "error", text: result.error || "Error" });
    }
  }

  return (
    <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 mb-8">
      <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t["dashboard.manageTeam"]}
      </h3>
      <p className="text-drawsports-text-muted text-sm mb-4">
        {t["dashboard.manageTeam.desc"]}
      </p>
      <p className="text-white text-sm mb-4">
        {t["dashboard.manageTeam.seats"]}: {members.length} / {seatsLimit}
      </p>

      {slotsLeft > 0 && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t["dashboard.manageTeam.placeholder"]}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-drawsports-primary focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-drawsports-primary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? t["dashboard.manageTeam.adding"] : t["dashboard.manageTeam.add"]}
          </button>
        </form>
      )}

      {message && (
        <p className={`text-sm mb-4 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.email} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-white">{m.email}</span>
            <span className="text-drawsports-text-muted text-xs">
              {m.organization_role === "owner" ? t["dashboard.manageTeam.owner"] : t["dashboard.manageTeam.member"]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
