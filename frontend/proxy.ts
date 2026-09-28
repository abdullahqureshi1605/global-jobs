import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminLoginApi = pathname === "/api/admin/login";

  const isNextAuthApi = pathname.startsWith("/api/auth");

  // Public authentication endpoints.
  if (
    isNextAuthApi ||
    isAdminLoginPage ||
    isAdminLoginApi
  ) {
    return NextResponse.next();
  }

  // Non-admin website pages remain public.
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // OUR ADMIN LOGIN USES A CUSTOM COOKIE.
  // Do not require a NextAuth token for admin pages.
  const adminCookie =
    request.cookies.get("horizon_admin_session")?.value;

  if (adminCookie === "authenticated") {
    return NextResponse.next();
  }

  // Fall back to NextAuth only if an admin NextAuth token exists.
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    if (isAdminPage) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    return NextResponse.json(
      {
        error: "Authentication secret is not configured.",
      },
      { status: 500 }
    );
  }

  const token = await getToken({
    req: request,
    secret,
  });

  if (token?.role === "admin") {
    return NextResponse.next();
  }

  if (isAdminPage) {
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

  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
