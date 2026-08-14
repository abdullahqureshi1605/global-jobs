import Link from "next/link";
import { Briefcase } from "lucide-react";

import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

export const metadata = {
  title: "Jobs by Category | Horizon Jobs",
  description:
    "Explore international jobs by career category and industry.",
};

export default async function CategoriesPage() {
  const jobs = await JobService.getPublishedJobs();

  const categoryMap = new Map<string, number>();

  for (const job of jobs) {
    categoryMap.set(
      job.category,
      (categoryMap.get(job.category) || 0) + 1
    );
  }

  const categories = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="mb-10">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Career Areas
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Jobs by Category
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Explore published opportunities by the type of work you
            are looking for.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border p-10 text-center text-sm text-slate-500">
            No job categories are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {categories.map(([category, count]) => (
              <Link
                key={category}
                href={`/categories/${slugify(category)}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                  <Briefcase className="w-5 h-5" />
                </div>

                <h2 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {category}
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  {count} published{" "}
                  {count === 1 ? "job" : "jobs"}
                </p>

                <span className="inline-block mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  View jobs →
                </span>
              </Link>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}