"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Users, X } from "lucide-react";
import type { Locale } from "@/lib/translations";

type Member = { email: string; organization_role: string };
type Invite = { id: string; email: string };

export function ManageTeam({
  orgId,
  orgName: initialOrgName,
  seatsLimit,
  members,
  invites,
  locale,
  t,
}: {
  orgId: string;
  orgName: string;
  seatsLimit: number;
  members: Member[];
  invites: Invite[];
  locale: Locale;
  t: Record<string, string>;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const [orgName, setOrgName] = useState(initialOrgName);
  const [orgNameEdit, setOrgNameEdit] = useState(initialOrgName);
  const [savingName, setSavingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [invitesList, setInvitesList] = useState(invites);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const slotsLeft = seatsLimit - members.length;

  async function handleRevokeInvite(inviteId: string) {
    setRevokingId(inviteId);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("organization_invites")
      .delete()
      .eq("id", inviteId)
      .eq("organization_id", orgId);
    setRevokingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setInvitesList((prev) => prev.filter((i) => i.id !== inviteId));
    setMessage({ type: "success", text: locale === "es" ? "Invitación revocada" : "Invitation revoked" });
    router.refresh();
  }

  async function handleSaveTeamName(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSavingName(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!session?.access_token || !supabaseUrl) {
      setMessage({ type: "error", text: "Sesión expirada." });
      setSavingName(false);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/update-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ org_id: orgId, name: orgNameEdit.trim(), action: "update" }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      setSavingName(false);
      if (res.ok && result?.success) {
        setOrgName(orgNameEdit.trim());
        setIsEditingName(false);
        setMessage({ type: "success", text: t["dashboard.teamName.updated"] });
        router.refresh(); // Actualiza la tarjeta TEAM del dashboard
      } else {
        setMessage({ type: "error", text: result?.error || "Error" });
      }
    } catch {
      setSavingName(false);
      setMessage({ type: "error", text: "Error inesperado" });
    }
  }

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
      <div className="mb-6">
        <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-2">
          {t["dashboard.teamName"]}
        </h3>
        {isEditingName ? (
          <form onSubmit={handleSaveTeamName} className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={orgNameEdit}
              onChange={(e) => setOrgNameEdit(e.target.value)}
              placeholder="Ej: Equipo Barcelona"
              minLength={2}
              maxLength={100}
              required
              className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-drawsports-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingName}
              className="px-4 py-2 rounded-xl bg-drawsports-primary text-white font-bold hover:opacity-90 disabled:opacity-50"
            >
              {savingName ? t["dashboard.teamName.saving"] : t["dashboard.teamName.save"]}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingName(false);
                setOrgNameEdit(orgName);
              }}
              className="px-4 py-2 rounded-xl border border-white/20 text-drawsports-text-muted text-sm hover:bg-white/5"
            >
              {t["dashboard.teamName.cancel"]}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{orgName}</p>
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="text-drawsports-primary hover:underline text-sm font-medium"
            >
              {t["dashboard.teamName.edit"]}
            </button>
          </div>
        )}
      </div>
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
        {invitesList.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
            <span className="text-drawsports-text-muted flex-1">{inv.email}</span>
            <span className="text-drawsports-text-muted text-xs shrink-0">
              {locale === "es" ? "Pendiente" : "Pending"}
            </span>
            <button
              type="button"
              onClick={() => handleRevokeInvite(inv.id)}
              disabled={revokingId === inv.id}
              className="p-1.5 rounded text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
              aria-label={locale === "es" ? "Revocar invitación" : "Revoke invitation"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
