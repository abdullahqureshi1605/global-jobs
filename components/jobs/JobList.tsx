import Link from "next/link";

import type { Job } from "@/types/job";

import { slugify } from "@/lib/utils/slug";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface JobListProps {
  jobs: Job[];

  /**
   * Optional contextual URL builder.
   *
   * When provided, the job card uses this URL instead of
   * the default /jobs/[slug] route.
   */
  hrefForJob?: (
    job: Job
  ) => string;

  emptyMessage?: string;
}

export default function JobList({
  jobs,
  hrefForJob,
  emptyMessage = "No jobs available.",
}: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Jobs Available
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => {
        const CategoryIcon =
          getCategoryIcon(
            job.category
          );

        const jobHref =
          hrefForJob?.(job) ??
          `/jobs/${job.slug}`;

        return (
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

              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                {job.company}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {job.category}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.country}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.city}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.workplaceType}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.employmentType}
                </span>
              </div>

              {job.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {job.description}
                </p>
              )}
            </div>

            <Link
              href={jobHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              View Job
            </Link>
          </article>
        );
      })}
    </div>
  );
}