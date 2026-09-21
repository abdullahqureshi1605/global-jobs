import { requireAdminAccess } from "@/lib/adminAccess";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminRecruitersPage() {
  await requireAdminAccess();

  const [
    membershipsResult,
    companiesResult,
    usersResult,
  ] = await Promise.all([

    supabaseAdmin
      .from("company_members")
      .select("company_id,user_id,role,created_at")
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin
      .from("companies")
      .select(
        "id,name,slug,industry,verification_status,website,created_at"
      ),

    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  const memberships =
    membershipsResult.data ?? [];

  const companies =
    companiesResult.data ?? [];

  const authUsers =
    usersResult.data?.users ?? [];

  const companyMap = new Map(
    companies.map((company) => [
      String(company.id),
      company,
    ])
  );

  const userMap = new Map(
    authUsers.map((user) => [
      String(user.id),
      user,
    ])
  );

  const recruiters =
    memberships.map((member) => {

      const user =
        userMap.get(String(member.user_id));

      const company =
        companyMap.get(String(member.company_id));

      return {
        id: member.user_id,
        email: user?.email ?? "—",
        name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          "Recruiter",
        company:
          company?.name ||
          "Unknown company",
        companyStatus:
          company?.verification_status ||
          "unknown",
        role:
          member.role || "member",
        created:
          member.created_at,
      };
    });

  const verifiedCompanies =
    companies.filter(
      (company) =>
        company.verification_status === "verified"
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Platform
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Recruiters
          </h1>

          <p className="mt-2 text-slate-400">
            Real recruiter memberships connected to Horizon Jobs companies.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Recruiter memberships
            </div>
            <div className="mt-2 text-3xl font-black">
              {recruiters.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Companies
            </div>
            <div className="mt-2 text-3xl font-black">
              {companies.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Verified companies
            </div>
            <div className="mt-2 text-3xl font-black">
              {verifiedCompanies}
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr className="text-left text-slate-400">
                  <th className="px-5 py-4">Recruiter</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Company status</th>
                  <th className="px-5 py-4">Joined</th>
                </tr>
              </thead>

              <tbody>

                {recruiters.map((recruiter) => (
                  <tr
                    key={`${recruiter.id}-${recruiter.company}`}
                    className="border-b border-white/5"
                  >

                    <td className="px-5 py-4">
                      <div className="font-bold">
                        {recruiter.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {recruiter.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {recruiter.company}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-400">
                      {String(recruiter.role)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold capitalize">
                        {String(recruiter.companyStatus).replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(recruiter.created).toLocaleDateString()}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {recruiters.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No recruiter memberships found.
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
