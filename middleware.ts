import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /, /es, /en → login o dashboard según auth (nunca mostrar portada)
  if (pathname === "/" || pathname === "/es" || pathname === "/en") {
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
    const locale = pathname === "/en" ? "en" : "es";
    const dest = user ? `/${locale}/dashboard` : `/${locale}/login`;
    return NextResponse.redirect(new URL(dest, request.url));
  }
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/es/login", request.url));
  }
  if (pathname === "/after-payment") {
    return NextResponse.redirect(new URL("/es/after-payment", request.url));
  }
  if (pathname === "/signup" || pathname === "/es/signup" || pathname === "/en/signup") {
    const locale = pathname === "/en/signup" ? "en" : "es";
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/es/dashboard", request.url));
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
