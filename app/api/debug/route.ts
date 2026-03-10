import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Step = { name: string; status: "ok" | "error"; message?: string };

const DEBUG_ALLOWED_EMAILS = (process.env.DEBUG_ALLOWED_EMAILS ?? "basketouch@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const results: Step[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !DEBUG_ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Env
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    results.push({
      name: "Env: SUPABASE_URL",
      status: hasUrl ? "ok" : "error",
      message: hasUrl ? "OK" : "Falta",
    });
    results.push({
      name: "Env: SUPABASE_ANON_KEY",
      status: hasKey ? "ok" : "error",
      message: hasKey ? "OK" : "Falta",
    });

    results.push({ name: "createClient (server)", status: "ok", message: "OK" });

    results.push({
      name: "auth.getUser",
      status: "ok",
      message: `${user.email} (${user.id.slice(0, 8)}...)`,
    });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, is_pro, organization_id, organization_role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      results.push({ name: "profiles (RLS)", status: "error", message: profileError.message });
      return NextResponse.json({ steps: results });
    }
    if (!profile) {
      results.push({ name: "profiles (RLS)", status: "error", message: "Perfil no encontrado" });
      return NextResponse.json({ steps: results });
    }

    results.push({
      name: "profiles (RLS)",
      status: "ok",
      message: `org=${profile.organization_id ?? "null"} role=${profile.organization_role ?? "null"}`,
    });

    if (profile.organization_id) {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, seats_limit")
        .eq("id", profile.organization_id)
        .maybeSingle();

      if (orgError) {
        results.push({ name: "organizations (RLS)", status: "error", message: orgError.message });
      } else if (!orgData) {
        results.push({ name: "organizations (RLS)", status: "error", message: "Org no encontrada" });
      } else {
        results.push({
          name: "organizations (RLS)",
          status: "ok",
          message: `"${orgData.name}" (${orgData.seats_limit})`,
        });

        if (profile.organization_role === "owner") {
          const { data: invites, error: invError } = await supabase
            .from("organization_invites")
            .select("id, email")
            .eq("organization_id", profile.organization_id)
            .eq("status", "pending");

          if (invError) {
            results.push({
              name: "organization_invites (RLS)",
              status: "error",
              message: invError.message,
            });
          } else {
            results.push({
              name: "organization_invites (RLS)",
              status: "ok",
              message: `${invites?.length ?? 0} invites`,
            });
          }
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Excepción", status: "error", message: msg });
  }

  return NextResponse.json({ steps: results });
}
