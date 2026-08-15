import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ResourceRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  published_date: string | null;
  read_time: string;
  status: string;
  featured: boolean;
}

export default async function AdminResourcesPage() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const {
    data: resources,
    error,
  } = await supabaseAdmin
    .from("resources")
    .select(
      `
      id,
      title,
      slug,
      category,
      author,
      published_date,
      read_time,
      status,
      featured
      `
    )
    .order("created_at", {
      ascending: false,
    });

  const resourceRows =
    (resources as ResourceRow[] | null) ||
    [];

  const publishedCount =
    resourceRows.filter(
      (resource) =>
        resource.status ===
        "published"
    ).length;

  const draftCount =
    resourceRows.filter(
      (resource) =>
        resource.status !==
        "published"
    ).length;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Admin Dashboard
            </Link>

            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Career Resources
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create, edit, publish, feature, and manage all career articles and guides.
            </p>
          </div>

          <Link
            href="/admin/resources/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            + Add New Resource
          </Link>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Resources"
            value={resourceRows.length}
            tone="default"
          />

          <StatCard
            label="Published"
            value={publishedCount}
            tone="success"
          />

          <StatCard
            label="Draft / Archived"
            value={draftCount}
            tone="warning"
          />
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Failed to load resources:{" "}
            {error.message}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resource
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Author
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Featured
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resourceRows.map(
                  (resource) => (
                    <tr
                      key={resource.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-5">
                        <div className="min-w-[300px]">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {resource.title}
                          </div>

                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            /{resource.slug}
                          </div>

                          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                            {resource.read_time ||
                              "Reading time not set"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {resource.category}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {resource.author}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge
                          status={
                            resource.status
                          }
                        />
                      </td>

                      <td className="px-5 py-5">
                        {resource.featured ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            Featured
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/resources/${encodeURIComponent(
                            resource.id
                          )}/edit`}
                          className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {resourceRows.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl">
                📚
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No Career Resources Yet
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Add your first career article using the button above.
              </p>

              <Link
                href="/admin/resources/new"
                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Add New Resource
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "success" | "warning";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
      ? "text-amber-600"
      : "text-slate-900 dark:text-white";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <strong
        className={`mt-1 block text-2xl font-bold ${valueClass}`}
      >
        {value}
      </strong>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        Published
      </span>
    );
  }

  if (status === "draft") {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        Draft
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {status}
    </span>
  );
}