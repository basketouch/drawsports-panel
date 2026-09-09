import { redirect } from "next/navigation";
import { toPublicLocale } from "@/lib/public-locale";

/** Legacy URL — el panel entra con código OTP, no contraseña. */
export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${toPublicLocale(locale)}/login`);
}
