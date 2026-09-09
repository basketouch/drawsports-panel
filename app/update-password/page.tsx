import { redirect } from "next/navigation";

/** Legacy URL — el panel entra con código OTP, no contraseña. */
export default function UpdatePasswordPage() {
  redirect("/es/login");
}
