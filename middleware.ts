import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /, /es, /en, /zh, /ja → login o dashboard según auth (nunca mostrar portada)
  if (pathname === "/" || pathname === "/es" || pathname === "/en" || pathname === "/zh" || pathname === "/ja") {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    const locale = pathname === "/en" ? "en" : pathname === "/zh" ? "zh" : pathname === "/ja" ? "ja" : "es";
    const dest = user ? `/${locale}/dashboard` : `/${locale}/login`;
    return NextResponse.redirect(new URL(dest, request.url));
  }
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/es/login", request.url));
  }
  if (pathname === "/after-payment") {
    return NextResponse.redirect(new URL("/es/after-payment", request.url));
  }
  if (pathname === "/signup" || pathname === "/es/signup" || pathname === "/en/signup" || pathname === "/zh/signup" || pathname === "/ja/signup") {
    const locale = pathname === "/en/signup" ? "en" : pathname === "/zh/signup" ? "zh" : pathname === "/ja/signup" ? "ja" : "es";
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/es/dashboard", request.url));
  }
  if (pathname === "/debug") {
    return NextResponse.redirect(new URL("/es/debug", request.url));
  }

  // /es/debug, /en/debug, /zh/debug, /api/debug: solo emails permitidos (DEBUG_ALLOWED_EMAILS)
  const debugPaths = ["/es/debug", "/en/debug", "/zh/debug", "/ja/debug"];
  const isDebugApi = pathname === "/api/debug";
  if (debugPaths.includes(pathname) || isDebugApi) {
    const allowed = (process.env.DEBUG_ALLOWED_EMAILS ?? "basketouch@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !allowed.includes(user.email.toLowerCase())) {
      if (isDebugApi) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const locale = pathname.startsWith("/en") ? "en" : pathname.startsWith("/zh") ? "zh" : pathname.startsWith("/ja") ? "ja" : "es";
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|imagenes|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
