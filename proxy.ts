import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";
  const isNextAuth = pathname.startsWith("/api/auth");

  // Allow login and auth pages to load without checking
  if (isNextAuth || isLogin) {
    return NextResponse.next();
  }

  // If not admin page or admin API, let it through
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Check if user is logged in
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // If NOT logged in
  if (!token) {
    if (isAdminPage) {
      // Send to login page
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    // For API, return 401 Unauthorized
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // User is logged in, allow access
  return NextResponse.next();
}

// Tell Next.js which routes to check
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};