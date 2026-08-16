import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic =
  "force-dynamic";

async function resolveCategory(
  slug: string
) {
  const { data, error } =
    await supabaseAdmin
      .from("jobs")
      .select("category")
      .eq(
        "status",
        "published"
      )
      .not(
        "category",
        "is",
        null
      );

  if (error) {
    throw new Error(
      `Failed to resolve category: ${error.message}`
    );
  }

  const categories =
    Array.from(
      new Set(
        (data ?? [])
          .map(
            (row) =>
              row.category
          )
          .filter(
            (
              value
            ): value is string =>
              typeof value ===
                "string" &&
              value.trim() !== ""
          )
          .map(
            (value) =>
              value.trim()
          )
      )
    );

  return (
    categories.find(
      (category) =>
        slugify(category) ===
        slug
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const category =
    await resolveCategory(
      slug
    );

  return {
    title: category
      ? `${category} Jobs | Horizon Jobs`
      : "Category Jobs | Horizon Jobs",

    description: category
      ? `Explore published ${category} jobs on Horizon Jobs.`
      : "Explore published jobs by category.",
  };
}

export default async function CategoryPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const category =
    await resolveCategory(
      slug
    );

  if (!category) {
    notFound();
  }

  const jobs =
    await JobService.getJobsByCategory(
      category
    );

  const CategoryIcon =
    getCategoryIcon(
      category
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <CategoryIcon className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Career Category
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                {category} Jobs
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {jobs.length} published{" "}
            {jobs.length === 1
              ? "job"
              : "jobs"}{" "}
            available.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Jobs Available
            </h2>

            <Link
              href="/categories"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map(
              (job) => (
                <article
                  key={job.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex-1">
                    {job.featured && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}

                    <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {job.company}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.country}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.city}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.workplaceType}
                      </span>
                    </div>

                    {job.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/jobs/${job.slug}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    View Job
                  </Link>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}