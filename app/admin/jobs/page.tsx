import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  title: string;
  company: string;
  country: string;
  city: string;
  category: string;
  status: string;
  featured: boolean;
  date_posted: string | null;
  updated_at: string | null;
}

export default async function AdminJobsPage() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Access Required
          </h1>

          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  const {
    data: jobs,
    error,
  } = await supabaseAdmin
    .from("jobs")
    .select(
      `
      id,
      title,
      company,
      country,
      city,
      category,
      status,
      featured,
      date_posted,
      updated_at
    `
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  const jobRows =
    (jobs as JobRow[] | null) ||
    [];

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Manage Jobs
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Edit, publish, unpublish, feature, or archive every job listing.
            </p>
          </div>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            + Add New Job
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Failed to load jobs:{" "}
            {error.message}
          </div>
        )}

        {!error &&
          jobRows.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-4xl">
                💼
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                No jobs yet
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Add your first job listing to start building the platform.
              </p>

              <Link
                href="/admin/jobs/new"
                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Add New Job
              </Link>
            </div>
          )}

        {jobRows.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Job
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Updated
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {jobRows.map((job) => (
                    <tr
                      key={job.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <div className="min-w-[260px]">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {job.title}
                          </div>

                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {job.company}
                          </div>

                          {job.featured && (
                            <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="min-w-[160px] text-sm text-slate-700 dark:text-slate-300">
                          {job.city}
                        </div>

                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {job.country}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {job.category}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            job.status
                          }
                        />
                      </td>

                      <td className="px-6 py-5">
                        <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(
                            job.updated_at
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/jobs/${encodeURIComponent(
                            job.id
                          )}/edit`}
                          className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (
    normalized ===
    "published"
  ) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        Published
      </span>
    );
  }

  if (
    normalized ===
    "archived"
  ) {
    return (
      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      Draft
    </span>
  );
}