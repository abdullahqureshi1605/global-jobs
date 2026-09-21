import { requireAdminAccess } from "@/lib/adminAccess";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  await requireAdminAccess();

  const [
    companiesResult,
    membershipsResult,
  ] = await Promise.all([

    supabaseAdmin
      .from("companies")
      .select(
        "id,name,slug,industry,website,size_range,verification_status,created_at,updated_at"
      )
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin
      .from("company_members")
      .select("company_id,user_id,role"),
  ]);

  const companies =
    companiesResult.data ?? [];

  const memberships =
    membershipsResult.data ?? [];

  const memberCounts =
    new Map<string, number>();

  for (const member of memberships) {
    const key =
      String(member.company_id);

    memberCounts.set(
      key,
      (memberCounts.get(key) ?? 0) + 1
    );
  }

  const verified =
    companies.filter(
      (company) =>
        company.verification_status === "verified"
    ).length;

  const pending =
    companies.filter(
      (company) =>
        company.verification_status === "pending"
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Platform
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Companies
          </h1>

          <p className="mt-2 text-slate-400">
            Real employer and company records from Supabase.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Total companies
            </div>
            <div className="mt-2 text-3xl font-black">
              {companies.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Verified
            </div>
            <div className="mt-2 text-3xl font-black">
              {verified}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-slate-400">
              Pending
            </div>
            <div className="mt-2 text-3xl font-black">
              {pending}
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr className="text-left text-slate-400">
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Industry</th>
                  <th className="px-5 py-4">Size</th>
                  <th className="px-5 py-4">Members</th>
                  <th className="px-5 py-4">Verification</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody>

                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-white/5"
                  >

                    <td className="px-5 py-4">

                      <div className="font-bold">
                        {company.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        /{company.slug}
                      </div>

                      {company.website && (
                        <div className="mt-1 text-xs text-cyan-400">
                          {company.website}
                        </div>
                      )}

                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {company.industry || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {company.size_range || "—"}
                    </td>

                    <td className="px-5 py-4">
                      {memberCounts.get(
                        String(company.id)
                      ) ?? 0}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold capitalize">
                        {String(
                          company.verification_status
                        ).replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(
                        company.created_at
                      ).toLocaleDateString()}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {companies.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No companies found.
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
