import type { Metadata } from "next";
import Link from "next/link";

import { TaxonomyService } from "@/services/taxonomyService";
import { slugify } from "@/lib/utils/slug";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Jobs by Category | Horizon Jobs",
  description:
    "Explore global employment opportunities by career category.",
};

export default async function CategoriesPage() {
  const categories =
    await TaxonomyService.getCategoryCounts();

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Career Areas
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs by Category
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Explore published opportunities by career category.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No categories are available yet.
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const CategoryIcon =
                getCategoryIcon(
                  category.category
                );

              return (
                <Link
                  key={
                    category.category
                  }
                  href={`/categories/${slugify(
                    category.category
                  )}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <CategoryIcon className="h-6 w-6" />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {category.category}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {category.count} published{" "}
                    {category.count === 1
                      ? "job"
                      : "jobs"}
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    View Jobs →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}