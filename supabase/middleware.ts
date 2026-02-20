import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          const isProd = process.env.NODE_ENV === "production";
          cookiesToSet.forEach(({ name, value, options }) => {
            const { path, maxAge, expires, domain, secure, httpOnly, sameSite } = options ?? {};
            supabaseResponse.cookies.set(name, value, {
              path: path ?? "/",
              ...(maxAge != null && { maxAge }),
              ...(expires != null && { expires }),
              ...(domain != null && { domain }),
              secure: secure ?? isProd,
              ...(httpOnly != null && { httpOnly }),
              sameSite: (sameSite as "lax" | "strict" | "none") ?? "lax",
            });
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
