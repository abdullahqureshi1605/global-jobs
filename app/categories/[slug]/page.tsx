import type { Metadata } from "next";
import Link from "next/link";

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

async function getCategoryName(
  slug: string
) {
  const map =
    await JobService.getPublishedCategoryCounts();

  const found =
    Array.from(
      map.keys()
    ).find(
      (category) =>
        slugify(category) ===
        slug
    );

  return found ?? null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const category =
    await getCategoryName(
      slug
    );

  return {
    title: category
      ? `${category} Jobs | Horizon Jobs`
      : "Category Jobs | Horizon Jobs",

    description: category
      ? `Explore published ${category} jobs.`
      : "Explore published jobs by category.",
  };
}

export default async function CategoryJobsPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const category =
    await getCategoryName(
      slug
    );

  if (!category) {
    return (
      <NotFoundCategory />
    );
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

          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            {jobs.length} published{" "}
            {jobs.length === 1
              ? "job"
              : "jobs"}{" "}
            available in{" "}
            {category}.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No jobs available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no published jobs in this category right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map(
              (job) => (
                <article
                  key={job.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.country}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.city}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {
                          job.workplaceType
                        }
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {
                          job.employmentType
                        }
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {
                        job.description
                      }
                    </p>
                  </div>

                  <Link
                    href={`/jobs/${slugify(
                      job.country
                    )}/${slugify(
                      job.city
                    )}/${job.slug}`}
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

function NotFoundCategory() {
  return (
    <main className="min-h-screen bg-slate-100 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Category Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            This category does not currently have a published job page.
          </p>

          <Link
            href="/categories"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </main>
  );
}