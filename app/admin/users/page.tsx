import { requireAdminAccess } from "@/lib/adminAccess";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminAccess();

  const [authResult, profilesResult, membershipsResult] =
    await Promise.all([
      supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      }),

      supabaseAdmin
        .from("profiles")
        .select(
          "id,full_name,headline,city,phone,profile_strength,is_admin,created_at,updated_at"
        )
        .order("created_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("company_members")
        .select("user_id,role,created_at")
        .not("user_id", "is", null),
    ]);

  const authUsers =
    authResult.data?.users ?? [];

  const profiles =
    profilesResult.data ?? [];

  const memberships =
    membershipsResult.data ?? [];

  /*
   * IMPORTANT:
   *
   * A recruiter has a company_members record.
   * Recruiters belong in /admin/recruiters, not /admin/users.
   *
   * We therefore exclude every Auth user that has a
   * company_members membership from the Users table.
   */

  const recruiterUserIds = new Set(
    memberships
      .map((membership) => String(membership.user_id))
      .filter(Boolean)
  );

  const profileMap = new Map(
    profiles.map((profile) => [
      String(profile.id),
      profile,
    ])
  );

  const candidateUsers = authUsers
    .filter((user) => {
      const userId = String(user.id);

      /*
       * Never show recruiter/company members
       * inside the normal Users table.
       */
      if (recruiterUserIds.has(userId)) {
        return false;
      }

      /*
       * Admin accounts are administrative accounts,
       * not normal platform users.
       */
      const profile = profileMap.get(userId);

      if (profile?.is_admin === true) {
        return false;
      }

      return true;
    })
    .map((user) => {
      const profile =
        profileMap.get(String(user.id));

      return {
        id: user.id,
        email: user.email ?? "—",
        name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "Unnamed user",
        city: profile?.city || "—",
        admin: Boolean(profile?.is_admin),
        confirmed: Boolean(user.email_confirmed_at),
        created: user.created_at,
        lastSignIn: user.last_sign_in_at,
        strength:
          Number(profile?.profile_strength ?? 0),
      };
    });

  /*
   * Defensive email de-duplication.
   *
   * Even if bad historical data somehow exists,
   * the same normalized email can only appear once
   * in the Users table.
   */
  const emailSet = new Set<string>();

  const users = candidateUsers.filter((user) => {
    const normalizedEmail =
      user.email.trim().toLowerCase();

    if (!normalizedEmail || normalizedEmail === "—") {
      return true;
    }

    if (emailSet.has(normalizedEmail)) {
      return false;
    }

    emailSet.add(normalizedEmail);

    return true;
  });

  const confirmed =
    users.filter((user) => user.confirmed).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Platform
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Users
          </h1>

          <p className="mt-2 text-slate-400">
            Registered candidate users. Recruiter accounts are shown separately in Recruiters.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Candidate users
            </div>

            <div className="mt-2 text-3xl font-black">
              {users.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Confirmed
            </div>

            <div className="mt-2 text-3xl font-black">
              {confirmed}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Recruiters excluded
            </div>

            <div className="mt-2 text-3xl font-black">
              {recruiterUserIds.size}
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-white/10 bg-white/[0.03]">

                <tr className="text-left text-slate-400">

                  <th className="px-5 py-4">
                    User
                  </th>

                  <th className="px-5 py-4">
                    Location
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Profile
                  </th>

                  <th className="px-5 py-4">
                    Created
                  </th>

                  <th className="px-5 py-4">
                    Last sign in
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-white/5"
                  >

                    <td className="px-5 py-4">

                      <div className="font-bold">
                        {user.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {user.email}
                      </div>

                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {user.city}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex flex-wrap gap-2">

                        {user.confirmed && (
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                            Confirmed
                          </span>
                        )}

                      </div>

                    </td>

                    <td className="px-5 py-4">
                      {user.strength}/100
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(
                        user.created
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-slate-400">

                      {user.lastSignIn
                        ? new Date(
                            user.lastSignIn
                          ).toLocaleDateString()
                        : "Never"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {users.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No registered candidate users found.
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
