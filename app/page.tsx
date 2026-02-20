import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/es/dashboard" : "/es/login");
}
