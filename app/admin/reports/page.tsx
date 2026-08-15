import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface JobReport {
  id: string;
  job_url: string;
  reason: string;
  details: string | null;
  created_at: string;
}

export default async function AdminReportsPage() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("job_reports")
    .select(
      "id, job_url, reason, details, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  const reports =
    (data as JobReport[] | null) ||
    [];

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Admin Dashboard
          </Link>

          <div className="mt-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Reported Jobs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review job listings reported by website visitors and investigate potentially expired, misleading, incorrect, or suspicious listings.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Reports
            </span>

            <strong className="mt-1 block text-2xl font-bold text-slate-900 dark:text-white">
              {reports.length}
            </strong>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Review Queue
            </span>

            <strong className="mt-1 block text-2xl font-bold text-amber-700 dark:text-amber-300">
              {reports.length}
            </strong>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Failed to load reports:{" "}
            {error.message}
          </div>
        )}

        {!error &&
          reports.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-4xl">
                ✅
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                No Job Reports
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                There are currently no visitor reports waiting for review.
              </p>
            </div>
          )}

        {!error &&
          reports.length > 0 && (
            <div className="space-y-5">
              {reports.map(
                (report) => (
                  <article
                    key={report.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            Report
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {formatDate(
                              report.created_at
                            )}
                          </span>
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                          {report.reason}
                        </h2>

                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Reported Job
                          </p>

                          <a
                            href={
                              report.job_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block break-all text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {report.job_url}
                          </a>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Visitor Details
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {report.details ||
                              "No additional details provided."}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <a
                          href={
                            report.job_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 lg:w-auto"
                        >
                          Open Reported Job
                          <span className="ml-2">
                            ↗
                          </span>
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      Report ID: {report.id}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}