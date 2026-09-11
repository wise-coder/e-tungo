import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";

function isAdminLoginRoute(pathname: string) {
  return pathname === "/api/admin/login" || pathname === "/api/admin/logout";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/") && isAdminLoginRoute(pathname)) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const adminSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (adminSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redirectUrl = new URL("/signin", request.url);
  redirectUrl.searchParams.set("redirect", "/admin");
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
