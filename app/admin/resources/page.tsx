import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminResourcesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { data: resources, error } = await supabaseAdmin
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

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Administration
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Career Resources
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Create and manage career guides, articles, and resources.
            </p>
          </div>

          <Link
            href="/admin/resources/new"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Add New Resource
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Total Resources
            </span>

            <strong className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {resources?.length ?? 0}
            </strong>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Published
            </span>

            <strong className="block text-2xl font-bold text-emerald-600 mt-1">
              {
                resources?.filter(
                  (resource) =>
                    resource.status === "published"
                ).length ?? 0
              }
            </strong>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Draft / Archived
            </span>

            <strong className="block text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">
              {
                resources?.filter(
                  (resource) =>
                    resource.status !== "published"
                ).length ?? 0
              }
            </strong>
          </div>

        </div>

        {/* Database error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load resources: {error.message}
          </div>
        )}

        {/* Resource table */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
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

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                {resources?.map((resource) => (
                  <tr
                    key={resource.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >

                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {resource.title}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          /{resource.slug}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {resource.category}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {resource.author}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          resource.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : resource.status === "draft"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {resource.featured ? "Yes" : "No"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {(!resources ||
            resources.length === 0) && (
            <div className="p-12 text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                No Career Resources Yet
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Add your first career article using the button above.
              </p>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}