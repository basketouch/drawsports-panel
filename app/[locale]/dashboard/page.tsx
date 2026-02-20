import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { CheckCircle, XCircle, Calendar, Download, Mail, Zap, Users } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { ManageTeam } from "./ManageTeam";
import { SyncLicenseButton } from "./SyncLicenseButton";
import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "@/lib/translations";
import { LEMON_SQUEEZY_VARIANTS, getCheckoutUrl } from "@/lib/lemonsqueezy";

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Evitar caché: siempre datos frescos tras pago en Lemon Squeezy
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translations[locale as Locale];

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // DEBUG: logs temporales
  console.log("[Dashboard DEBUG] getUser:", {
    hasUser: !!user,
    userId: user?.id,
    userError: userError?.message ?? null,
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, is_pro, subscription_start, subscription_end, organization_id, organization_role")
    .eq("id", user.id)
    .maybeSingle();

  // DEBUG: logs temporales para diagnosticar perfil
  console.log("[Dashboard DEBUG] profile:", {
    hasProfile: !!profile,
    profileEmail: profile?.email,
    isPro: profile?.is_pro,
    organizationId: profile?.organization_id,
    profileError: profileError?.message ?? null,
    profileErrorCode: profileError?.code ?? null,
  });

  let org: { seats_limit: number; name: string } | null = null;
  let orgMembers: { email: string; organization_role: string }[] = [];
  let orgInvites: { id: string; email: string }[] = [];
  let orgName: string | null = null;

  if (profile?.organization_id) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("seats_limit, name")
      .eq("id", profile.organization_id)
      .single();
    orgName = orgData?.name ?? null;

    if (profile.organization_role === "owner") {
      // Fallback si RLS bloquea la lectura de organizations: usar valores por defecto
      org = orgData
        ? { seats_limit: orgData.seats_limit, name: orgData.name ?? "Mi equipo" }
        : { seats_limit: 3, name: "Mi equipo" };
      const { data: membersData } = await supabase
        .from("profiles")
        .select("id, email, organization_role")
        .eq("organization_id", profile.organization_id);
      orgMembers = (membersData ?? []).map((m) => ({
        id: m.id,
        email: m.email ?? "",
        organization_role: m.organization_role ?? "member",
      }));
      const { data: invitesData } = await supabase
        .from("organization_invites")
        .select("id, email")
        .eq("organization_id", profile.organization_id)
        .eq("status", "pending");
      orgInvites = (invitesData ?? []).map((i) => ({ id: i.id, email: i.email ?? "" }));
    }
  }


  const isMember = profile?.organization_role === "member";

  if (profileError) {
    console.error("[Dashboard] profiles fetch error:", profileError);
  }

  const email = profile?.email ?? user.email ?? "";
  const isPro = profile?.is_pro ?? false;
  const subscriptionStart = profile?.subscription_start
    ? new Date(profile.subscription_start)
    : null;
  const subscriptionEnd = profile?.subscription_end
    ? new Date(profile.subscription_end)
    : null;

  const today = new Date();
  const daysLeft = subscriptionEnd && isPro ? daysBetween(today, subscriptionEnd) : 0;
  const isExpired = subscriptionEnd && today > subscriptionEnd;

  return (
    <div className="min-h-screen bg-[#1a0f0f]">
      <header className="bg-drawsports-bg-card border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/imagenes/logo.png"
              alt="DrawSports"
              width={40}
              height={40}
              className="rounded-[22%]"
            />
            <span className="text-xl font-bold text-white">{t["dashboard.title"]}</span>
          </Link>
          <LogoutButton locale={locale as Locale} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Resumen de estado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {isPro && !isExpired ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-drawsports-primary/20 border border-drawsports-primary/40 text-drawsports-primary font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                {t["dashboard.pro.active"]}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-drawsports-text-muted font-medium text-sm">
                <XCircle className="w-4 h-4" />
                {t["dashboard.pro.inactive"]}
              </span>
            )}
            <span className="text-drawsports-text-muted text-sm">{email}</span>
          </div>
        </div>

        {/* Grid de cards: Plan, Equipo, Fechas - siempre 3 columnas para que se vea el espacio del equipo */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          {/* Plan */}
          <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 min-h-[180px] flex flex-col">
            <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4">
              {t["dashboard.plan"]}
            </h3>
            <p className="text-xl font-bold text-white">DrawSports PRO</p>
            <p className="text-drawsports-text-muted text-sm mt-1 flex-1">
              {isPro ? t["dashboard.pro.desc"] : t["dashboard.pro.desc.inactive"]}
            </p>
          </div>

          {/* Equipo - siempre visible: con datos si tiene org, placeholder si no */}
          <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 min-h-[180px] flex flex-col">
            <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4">
              {t["dashboard.team"]}
            </h3>
            {isPro && profile?.organization_id ? (
              <p className="text-white font-medium flex-1">{orgName || "Mi equipo"}</p>
            ) : (
              <div className="flex-1">
                <p className="text-drawsports-text-muted text-sm">{t["dashboard.team.noTeam"]}</p>
                <p className="text-drawsports-text-muted text-xs mt-2">{t["dashboard.team.choosePlan"]}</p>
              </div>
            )}
          </div>

          {/* Fechas - siempre visible, con datos que tengamos */}
          <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 min-h-[180px] flex flex-col">
            <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4">
              {t["dashboard.dates"]}
            </h3>
            <div className="space-y-4">
              {subscriptionStart && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-drawsports-primary flex-shrink-0" />
                  <div>
                    <p className="text-drawsports-text-muted text-xs">{t["dashboard.purchase"]}</p>
                    <p className="text-white font-medium">{formatDate(subscriptionStart, locale)}</p>
                  </div>
                </div>
              )}
              {subscriptionEnd && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-drawsports-primary flex-shrink-0" />
                  <div>
                    <p className="text-drawsports-text-muted text-xs">{t["dashboard.end"]}</p>
                    <p className="text-white font-medium">{formatDate(subscriptionEnd, locale)}</p>
                    <p className="text-drawsports-primary text-sm font-medium mt-1">
                      {isExpired
                        ? t["dashboard.expired"]
                        : daysLeft === 0
                          ? t["dashboard.expiresToday"]
                          : `${daysLeft} ${t["dashboard.daysLeft"]}`}
                    </p>
                  </div>
                </div>
              )}
              {isPro && !subscriptionStart && !subscriptionEnd && (
                <p className="text-drawsports-primary text-sm font-medium">
                  {t["dashboard.licenseActive"]}
                </p>
              )}
              {!isPro && !subscriptionStart && !subscriptionEnd && (
                <p className="text-drawsports-text-muted text-sm">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Gestionar equipo - con org: ManageTeam; sin org: placeholder para que se vea el espacio */}
        {org && profile?.organization_id ? (
          <ManageTeam
            orgId={profile.organization_id}
            orgName={org.name}
            seatsLimit={org.seats_limit}
            members={orgMembers}
            invites={orgInvites}
            currentUserId={user.id}
            locale={locale as Locale}
            t={t}
          />
        ) : !isMember ? (
          <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 mb-8">
            <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t["dashboard.manageTeam"]}
            </h3>
            <p className="text-drawsports-text-muted text-sm mb-4">
              {t["dashboard.team.choosePlan"]}
            </p>
            <p className="text-white text-sm">{t["dashboard.choosePlan"]} ↓</p>
          </div>
        ) : null}

        {/* Planes de compra - solo para owners (los members no compran) */}
        {!isMember && (
          <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 mb-8">
            <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4">
              {t["dashboard.choosePlan"]}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {LEMON_SQUEEZY_VARIANTS.map((variant) => (
                <a
                  key={variant.checkoutId}
                  href={getCheckoutUrl(variant.checkoutId, email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-white/10 hover:border-drawsports-primary hover:shadow-drawsports-glow transition-all duration-200 text-center"
                >
                  <p className="text-white font-bold text-lg">{variant.users} {t["dashboard.users"]}</p>
                  <p className="text-drawsports-primary text-sm font-medium mt-2">
                    {t["dashboard.buyPlan"]} →
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Qué incluye */}
        <div className="bg-drawsports-bg-card rounded-2xl border border-white/5 shadow-drawsports-card p-6 mb-8">
          <h3 className="text-drawsports-text-muted text-sm font-medium uppercase tracking-wider mb-4">
            {t["dashboard.whatsIncluded"]}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-white">
              <Zap className="w-5 h-5 text-drawsports-primary flex-shrink-0" />
              {t["dashboard.feature1"]}
            </li>
            <li className="flex items-center gap-3 text-white">
              <Zap className="w-5 h-5 text-drawsports-primary flex-shrink-0" />
              {t["dashboard.feature2"]}
            </li>
            <li className="flex items-center gap-3 text-white">
              <Zap className="w-5 h-5 text-drawsports-primary flex-shrink-0" />
              {t["dashboard.feature3"]}
            </li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://apps.apple.com/es/app/drawsports/id6756434573"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[50px] bg-drawsports-primary text-white font-bold shadow-drawsports-glow hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,23,68,0.5)] transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            {t["dashboard.download"]}
          </a>
          <a
            href="mailto:info@basketouch.com"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[50px] border border-white/20 text-drawsports-text-muted font-medium hover:border-drawsports-primary hover:text-white transition-all duration-200"
          >
            <Mail className="w-5 h-5" />
            {t["dashboard.support"]}
          </a>
        </div>

        {!isPro && (
          <div className="mt-6 p-4 rounded-xl bg-drawsports-primary/10 border border-drawsports-primary/30 space-y-2">
            <p className="text-sm text-white">
              {t["dashboard.refreshHint"]}
            </p>
            <SyncLicenseButton locale={locale as Locale} label={t["dashboard.syncLicense"]} />
            <p className="text-sm text-white">
              {t["dashboard.paid.hint"]}{" "}
              <a
                href="mailto:info@basketouch.com"
                className="font-bold text-drawsports-primary hover:underline"
              >
                info@basketouch.com
              </a>
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-10 text-center text-drawsports-text-muted text-sm border-t border-white/5">
        {t.footer}
      </footer>
    </div>
  );
}
