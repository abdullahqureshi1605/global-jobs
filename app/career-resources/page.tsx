import type { Metadata } from "next";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase/admin";
import BackButton from "@/components/navigation/BackButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Career Resources | Horizon Jobs",
  description:
    "Practical career guides covering resumes, interviews, job searching, workplace skills, and international careers.",
};

async function getResources() {
  const { data, error } =
    await supabaseAdmin
      .from("resources")
      .select(
        `
        id,
        title,
        slug,
        category,
        description,
        author,
        published_date,
        read_time,
        featured
        `
      )
      .eq("status", "published")
      .order("published_date", {
        ascending: false,
      })
      .limit(24);

  if (error) {
    throw new Error(
      `Failed to load career resources: ${error.message}`
    );
  }

  return data ?? [];
}

export default async function CareerResourcesPage() {
  const resources =
    await getResources();

  const featured =
    resources.filter(
      (resource) =>
        resource.featured
    );

  const regular =
    resources.filter(
      (resource) =>
        !resource.featured
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton
            label="Back"
            fallbackHref="/"
          />
        </div>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Career Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Career Resources
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Practical guides to help you build stronger applications,
            prepare for interviews, understand international hiring
            practices, and make better career decisions.
          </p>
        </header>

        {resources.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No published resources yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Career resources will appear here after they are published.
            </p>
          </section>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-10">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Featured Guides
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {featured.slice(0, 2).map(
                    (resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        featured
                      />
                    )
                  )}
                </div>
              </section>
            )}

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Latest Career Guides
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {regular.map(
                  (resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                    />
                  )
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function ResourceCard({
  resource,
  featured = false,
}: {
  resource: {
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    author: string | null;
    published_date: string | null;
    read_time: string | null;
    featured: boolean;
  };
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
        featured ? "lg:p-8" : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {resource.category}
          </span>

          {resource.featured && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Featured
            </span>
          )}
        </div>

        <h3
          className={`mt-4 font-extrabold text-slate-900 dark:text-white ${
            featured
              ? "text-2xl"
              : "text-xl"
          }`}
        >
          {resource.title}
        </h3>

        <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {resource.description}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div>
            {resource.author
              ? `By ${resource.author}`
              : "Horizon Jobs"}
          </div>

          <div className="mt-1">
            {resource.read_time ||
              "Career guide"}
            {resource.published_date
              ? ` · ${resource.published_date}`
              : ""}
          </div>
        </div>

        <Link
          href={`/career-resources/${resource.slug}`}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Read Guide
        </Link>
      </div>
    </article>
  );
}