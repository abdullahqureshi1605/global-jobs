import Link from "next/link";
import { Briefcase } from "lucide-react";

import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

export const revalidate = 60;

export const metadata = {
  title: "Jobs by Category | Horizon Jobs",
  description:
    "Explore international jobs by career category and industry.",
};

export default async function CategoriesPage() {
  const categoryCounts =
    await JobService.getPublishedCategoryCounts();

  const categories =
    Array.from(
      categoryCounts.entries()
    ).sort(
      (a, b) => b[1] - a[1]
    );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <header className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Career Areas
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Jobs by Category
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Explore published opportunities by the type of work you are
            looking for.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No job categories are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(
              ([category, count]) => (
                <Link
                  key={category}
                  href={`/categories/${slugify(
                    category
                  )}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Briefcase className="h-5 w-5" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {category}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {count} published{" "}
                    {count === 1
                      ? "job"
                      : "jobs"}
                  </p>

                  <span className="mt-5 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    View jobs →
                  </span>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}