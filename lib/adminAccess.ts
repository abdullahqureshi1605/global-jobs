import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const ADMIN_COOKIE = "horizon_admin_session";

function configuredAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();

  const adminCookie = cookieStore.get(ADMIN_COOKIE);

  if (adminCookie?.value === "authenticated") {
    return true;
  }

  /*
   * Compatibility fallback:
   * Some existing admin pages use NextAuth.
   *
   * This NEVER grants admin access to an arbitrary NextAuth user.
   * The NextAuth email must exactly match ADMIN_EMAIL.
   */
  try {
    const session = await getServerSession(authOptions);

    const sessionEmail =
      session?.user?.email?.trim().toLowerCase() || "";

    const adminEmail = configuredAdminEmail();

    if (
      adminEmail &&
      sessionEmail &&
      sessionEmail === adminEmail
    ) {
      return true;
    }
  } catch {
    // No NextAuth session is fine when custom admin cookie exists.
  }

  return false;
}

export async function requireAdminAccess() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return {
    authenticated: true,
  };
}