import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirigir rutas sin locale a /es
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/es", request.url));
  }
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/es/login", request.url));
  }
  if (pathname === "/signup") {
    return NextResponse.redirect(new URL("/es/signup", request.url));
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
