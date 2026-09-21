import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { data: profile, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("id,full_name,is_admin")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !profile?.is_admin) {
    redirect("/?admin=denied");
  }

  return {
    session,
    profile,
  };
}
