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

export default async function AdminJobsPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    redirect("/admin/login");
  }

  const {
    data: jobs,
    error,
  } =
    await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("updated_at", {
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

        <div className="mb-8 mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
              Manage Jobs
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Edit, publish, unpublish, feature, or archive every job listing.
            </p>
          </div>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500"
          >
            + Add New Job
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Failed to load jobs:{" "}
            {error.message}
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Job
                    </th>

                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Updated
                    </th>

                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobs?.map(
                    (job) => (
                      <tr
                        key={job.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-950 dark:text-white">
                            {job.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {job.company}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {job.city}
                          </p>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {job.country}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                          {job.category}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              job.status ===
                              "published"
                                ? "bg-emerald-100 text-emerald-700"
                                : job.status ===
                                  "draft"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                          {job.updated_at
                            ? new Date(
                                job.updated_at
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-5">
                          <AdminActionMenu
                            editHref={`/admin/jobs/${job.id}/edit`}
                            deleteUrl={`/api/admin/jobs/${job.id}`}
                            itemName={
                              job.title
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {(!jobs ||
              jobs.length === 0) && (
              <div className="p-12 text-center text-sm text-slate-500">
                No jobs found.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}