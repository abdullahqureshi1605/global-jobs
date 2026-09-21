"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resource = {
  id: string;
  title: string;
  slug: string;
  body: string;
  category?: string | null;
  published_at?: string | null;
  created_at?: string;
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/resources",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json().catch(
        () => ({})
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Failed to load career resources."
        );
      }

      setResources(
        Array.isArray(data)
          ? data
          : data.resources || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load career resources."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteResource(id: string) {
    if (
      !window.confirm(
        "Delete this career resource permanently?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/resources/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(
        () => ({})
      );

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Delete failed."
        );
      }

      await loadResources();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Content Management
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Career Resources
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage genuine career articles stored in
              the Horizon Jobs database.
            </p>
          </div>

          <Link
            href="/admin/resources/new"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            + New Article
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <div className="font-semibold">
              Failed to load resources
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>

            <button
              onClick={loadResources}
              className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading real career resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-lg font-semibold">
              No career resources found
            </div>

            <p className="mt-2 text-sm text-slate-400">
              The database currently contains no career
              resources.
            </p>

            <Link
              href="/admin/resources/new"
              className="mt-5 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
            >
              Create First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">

                <thead className="border-b border-slate-800 bg-slate-950/70">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4">
                      Article
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {resources.map((resource) => {

                    const published =
                      Boolean(
                        resource.published_at
                      );

                    return (
                      <tr
                        key={resource.id}
                        className="transition hover:bg-slate-800/40"
                      >

                        <td className="px-5 py-5">
                          <div className="max-w-lg">

                            <div className="font-semibold text-white">
                              {resource.title}
                            </div>

                            <div className="mt-1 line-clamp-2 text-sm text-slate-400">
                              {resource.body}
                            </div>

                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-300">
                          {resource.category || "—"}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={
                              published
                                ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300"
                            }
                          >
                            {published
                              ? "published"
                              : "draft"}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-400">
                          {resource.published_at
                            ? new Date(
                                resource.published_at
                              ).toLocaleDateString()
                            : resource.created_at
                              ? new Date(
                                  resource.created_at
                                ).toLocaleDateString()
                              : "—"}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/admin/resources/${resource.id}/edit`}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-800"
                            >
                              Edit
                            </Link>

                            {published ? (
                              <Link
                                href={`/career-resources/${encodeURIComponent(resource.slug)}`}
                                target="_blank"
                                className="rounded-lg border border-cyan-500/30 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
                              >
                                Open
                              </Link>
                            ) : null}

                            <button
                              onClick={() =>
                                deleteResource(
                                  resource.id
                                )
                              }
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}