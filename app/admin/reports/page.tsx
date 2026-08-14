import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { data: reports, error } = await supabaseAdmin
    .from("job_reports")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Administration
        </p>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
          Reported Jobs
        </h1>

        <p className="text-sm text-slate-500 mt-2 mb-8">
          Review job listings reported by visitors.
        </p>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Failed to load reports: {error.message}
          </div>
        ) : reports?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border p-12 text-center text-sm text-slate-500">
            No job reports yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="p-4 text-xs uppercase text-slate-500">
                    Job URL
                  </th>

                  <th className="p-4 text-xs uppercase text-slate-500">
                    Reason
                  </th>

                  <th className="p-4 text-xs uppercase text-slate-500">
                    Details
                  </th>

                  <th className="p-4 text-xs uppercase text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports?.map((report) => (
                  <tr key={report.id}>

                    <td className="p-4 text-sm">
                      <a
                        href={report.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {report.job_url}
                      </a>
                    </td>

                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      {report.reason}
                    </td>

                    <td className="p-4 text-sm text-slate-500 max-w-sm">
                      {report.details || "—"}
                    </td>

                    <td className="p-4 text-xs text-slate-500">
                      {new Date(
                        report.created_at
                      ).toLocaleString()}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </main>
  );
}