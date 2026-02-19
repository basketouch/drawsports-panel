import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  const cookieStore = await cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const { path, maxAge, expires, domain, secure, httpOnly, sameSite } = options ?? {};
              cookieStore.set(name, value, {
                path: path ?? "/",
                ...(maxAge != null && { maxAge }),
                ...(expires != null && { expires }),
                ...(domain != null && { domain }),
                ...(secure != null && { secure }),
                ...(httpOnly != null && { httpOnly }),
                ...(sameSite != null && { sameSite }),
              });
            });
          } catch {
            // Ignore in Server Components (can't set cookies after streaming starts)
          }
        },
      },
    }
  );
}
