"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/translations";

export function EditableTeamName({
  orgId,
  orgName,
  canManage,
  locale,
  t,
}: {
  orgId: string;
  orgName: string;
  canManage: boolean;
  locale: Locale;
  t: Record<string, string>;
}) {
  const [name, setName] = useState(orgName);
  const [editValue, setEditValue] = useState(orgName);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!session?.access_token || !supabaseUrl) {
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/update-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ org_id: orgId, name: editValue.trim(), action: "update" }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean };
      setSaving(false);
      if (res.ok && result?.success) {
        setName(editValue.trim());
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      setSaving(false);
    }
  }

  if (isEditing && canManage) {
    return (
      <form onSubmit={handleSave} className="flex flex-wrap gap-2 items-center flex-1">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Ej: Equipo Barcelona"
          minLength={2}
          maxLength={100}
          required
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-drawsports-primary focus:outline-none text-xl font-bold"
          autoFocus
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-drawsports-primary text-white font-bold hover:opacity-90 disabled:opacity-50 text-sm"
        >
          {saving ? t["dashboard.teamName.saving"] : t["dashboard.teamName.save"]}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setEditValue(name);
          }}
          className="px-4 py-2 rounded-xl border border-white/20 text-drawsports-text-muted text-sm hover:bg-white/5"
        >
          {t["dashboard.teamName.cancel"]}
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 flex-wrap">
      <p className="text-2xl font-bold text-white">{name || "Mi equipo"}</p>
      {canManage && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-drawsports-primary hover:underline text-sm font-medium"
        >
          {t["dashboard.teamName.edit"]}
        </button>
      )}
    </div>
  );
}
