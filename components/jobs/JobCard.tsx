import Link from "next/link";

import type { Job } from "@/types/job";
import { slugify } from "@/lib/utils/slug";
import { countryCodeToFlag } from "@/lib/utils/countryFlag";
import { getCategoryIcon } from "@/lib/utils/categoryIcon";

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
}

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency?: string | null
) {
  if (
    min == null ||
    max == null ||
    !currency
  ) {
    return null;
  }

  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

export default function JobCard({
  job,
  onSelect,
}: JobCardProps) {
  const CategoryIcon = getCategoryIcon(
    job.category
  );

  const flag = countryCodeToFlag(
    job.countryCode
  );

  function handleSelect() {
    onSelect?.(job);
  }

  return (
    <article
      onClick={
        onSelect
          ? handleSelect
          : undefined
      }
      className={`flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
        onSelect
          ? "cursor-pointer"
          : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {job.featured && (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Featured
              </span>
            )}

            <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
              {job.title}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {job.company}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
            {flag}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <CategoryIcon className="h-3.5 w-3.5" />
            {job.category}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {flag} {job.country}
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

        {formatSalary(
          job.salaryMin,
          job.salaryMax,
          job.salaryCurrency
        ) && (
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {formatSalary(
              job.salaryMin,
              job.salaryMax,
              job.salaryCurrency
            )}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Link
          href={`/jobs/${slugify(
            job.country
          )}/${slugify(
            job.city
          )}/${job.slug}`}
          onClick={(event) => {
            /*
             * Prevent the parent card's onClick
             * from firing when the user actually
             * clicks the View Job link.
             */
            event.stopPropagation();
          }}
          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          View Job
        </Link>
      </div>
    </article>
  );
}