"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Users, X, Plus } from "lucide-react";
import type { Locale } from "@/lib/translations";

type Member = { id: string; email: string; organization_role: string; consumes_seat?: boolean };
type Invite = { id: string; email: string };

export function ManageTeam({
  orgId,
  seatsLimit,
  members,
  invites,
  currentUserId,
  canManage,
  locale,
  t,
}: {
  orgId: string;
  seatsLimit: number;
  members: Member[];
  invites: Invite[];
  currentUserId: string;
  canManage: boolean;
  locale: Locale;
  t: Record<string, string>;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const [invitesList, setInvitesList] = useState(invites);
  const [membersList, setMembersList] = useState(members);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingSeat, setTogglingSeat] = useState(false);

  // Members siempre consumen; owner solo si consumes_seat
  const membersCount = membersList.reduce((n, m) => {
    if (m.organization_role === "member") return n + 1;
    if (m.organization_role === "owner" && (m.consumes_seat ?? true)) return n + 1;
    return n;
  }, 0);
  const slotsLeft = seatsLimit - membersCount;

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
    setMessage({ type: "success", text: t["msg.inviteRevoked"] });
    router.refresh();
  }

  async function handleToggleOwnerSeat() {
    const owner = membersList.find((m) => m.id === currentUserId && m.organization_role === "owner");
    if (!owner) return;
    const newValue = !(owner.consumes_seat ?? true);
    setTogglingSeat(true);
    setMessage(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !supabaseUrl) {
      setMessage({ type: "error", text: t["msg.sessionExpired"] });
      setTogglingSeat(false);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/update-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ org_id: orgId, action: "toggle_owner_seat", consumes_seat: newValue }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      setTogglingSeat(false);
      if (res.ok && result?.success) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === currentUserId ? { ...m, consumes_seat: newValue } : m))
        );
        setMessage({
          type: "success",
          text: newValue ? t["msg.seatOccupied"] : t["msg.seatReleased"],
        });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result?.error || "Error" });
      }
    } catch {
      setTogglingSeat(false);
      setMessage({ type: "error", text: t["msg.unexpectedError"] });
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (memberId === currentUserId) return;
    setRemovingId(memberId);
    setMessage(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !supabaseUrl) {
      setMessage({ type: "error", text: t["msg.sessionExpired"] });
      setRemovingId(null);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/update-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ org_id: orgId, action: "remove_member", member_id: memberId }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      setRemovingId(null);
      if (res.ok && result?.success) {
        setMembersList((prev) => prev.filter((m) => m.id !== memberId));
        setMessage({ type: "success", text: t["msg.memberRemoved"] });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result?.error || "Error" });
      }
    } catch {
      setRemovingId(null);
      setMessage({ type: "error", text: t["msg.unexpectedError"] });
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
      const msg = result.invited ? t["dashboard.manageTeam.inviteSent"] : t["msg.memberAdded"];
      setMessage({ type: "success", text: msg });
      window.location.reload();
    } else {
      setMessage({ type: "error", text: result.error || "Error" });
    }
  }

  return (
    <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 mb-8">
      {canManage && (
        <>
          <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t["dashboard.manageTeam"]}
          </h3>
          <p className="text-drawsports-text-muted text-sm mb-4">
            {t["dashboard.manageTeam.desc"]}
          </p>
          <p className="text-white text-sm mb-4">
            {t["dashboard.manageTeam.seats"]}: {membersCount} / {seatsLimit}
          </p>
        </>
      )}

      {canManage && slotsLeft > 0 && (
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

      {canManage && message && (
        <p className={`text-sm mb-4 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      {canManage && (
      <div className="space-y-2">
        {membersList.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
            <span className="text-white flex-1">{m.email}</span>
            <span className="text-drawsports-text-muted text-xs shrink-0">
              {m.organization_role === "owner" ? t["dashboard.manageTeam.owner"] : t["dashboard.manageTeam.member"]}
            </span>
            {canManage && m.id === currentUserId && m.organization_role === "owner" && (
              (m.consumes_seat ?? true) ? (
                <button
                  type="button"
                  onClick={handleToggleOwnerSeat}
                  disabled={togglingSeat}
                  className="p-1.5 rounded text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                  aria-label={t["msg.releaseSeatAria"]}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleOwnerSeat}
                  disabled={togglingSeat}
                  className="p-1.5 rounded text-drawsports-primary hover:bg-drawsports-primary/20 transition-colors disabled:opacity-50 shrink-0"
                  aria-label={t["msg.occupySeatAria"]}
                >
                  <Plus className="w-4 h-4" />
                </button>
              )
            )}
            {canManage && m.id !== currentUserId && (
              <button
                type="button"
                onClick={() => handleRemoveMember(m.id)}
                disabled={removingId === m.id}
                className="p-1.5 rounded text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                aria-label={t["msg.removeFromTeamAria"]}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {canManage && invitesList.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
            <span className="text-drawsports-text-muted flex-1">{inv.email}</span>
            <span className="text-drawsports-text-muted text-xs shrink-0">
              {t["msg.pending"]}
            </span>
            <button
              type="button"
              onClick={() => handleRevokeInvite(inv.id)}
              disabled={revokingId === inv.id}
              className="p-1.5 rounded text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
              aria-label={t["msg.revokeInvitationAria"]}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
