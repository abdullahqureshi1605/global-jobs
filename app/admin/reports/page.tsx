import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import {
  authOptions,
} from "@/lib/auth";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import AdminActionMenu from "@/components/admin/AdminActionMenu";

export const dynamic =
  "force-dynamic";

export default async function AdminReportsPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    redirect("/admin/login");
  }

  const {
    data: reports,
    error,
  } =
    await supabaseAdmin
      .from("job_reports")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <Link
          href="/admin"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Admin Dashboard
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
            Reported Jobs
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review job listings reported by visitors.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Failed to load reports:{" "}
            {error.message}
          </div>
        ) : reports?.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No job reports yet.
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <tr>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Job URL
                    </th>

                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reason
                    </th>

                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Details
                    </th>

                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="p-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports?.map(
                    (report) => (
                      <tr
                        key={report.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="p-5 text-sm">
                          <a
                            href={
                              report.job_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {
                              report.job_url
                            }
                          </a>
                        </td>

                        <td className="p-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {report.reason}
                        </td>

                        <td className="max-w-sm p-5 text-sm text-slate-500 dark:text-slate-400">
                          {report.details ||
                            "—"}
                        </td>

                        <td className="p-5 text-xs text-slate-500">
                          {report.created_at
                            ? new Date(
                                report.created_at
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td className="p-5">
                          <AdminActionMenu
                            deleteUrl={`/api/admin/reports/${report.id}`}
                            itemName="this job report"
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}