import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { JobService } from "@/services/jobService";

export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const jobs = await JobService.getAllJobs();

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Administration
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Manage Jobs
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Add, review, publish, edit, and archive job listings.
            </p>
          </div>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Add New Job
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Total Jobs
            </span>

            <strong className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {jobs.length}
            </strong>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Published
            </span>

            <strong className="block text-2xl font-bold text-emerald-600 mt-1">
              {
                jobs.filter(
                  (job) => job.status === "published"
                ).length
              }
            </strong>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Draft / Archived
            </span>

            <strong className="block text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">
              {
                jobs.filter(
                  (job) => job.status !== "published"
                ).length
              }
            </strong>
          </div>

        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">

                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Job
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Verified
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >

                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {job.title}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {job.company}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {job.city}, {job.country}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {job.category}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          job.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : job.status === "draft"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {job.verificationStatus}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {jobs.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No jobs found.
            </div>
          )}

        </section>

      </div>
    </main>
  );
}