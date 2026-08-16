import Link from "next/link";

import {
  BriefcaseBusiness,
  MapPin,
} from "lucide-react";

import CountryFlag from "@/components/countries/CountryFlag";
import SaveJobButton from "@/components/jobs/SaveJobButton";

import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;

  country: string;
  countryCode?: string | null;

  city: string;
  category: string;

  employmentType: string;
  workplaceType: string;
  experienceLevel: string;

  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;

  description?: string | null;

  requirements?: unknown;
  responsibilities?: unknown;
  benefits?: unknown;

  sourceName?: string | null;
  sourceUrl?: string | null;

  applyUrl: string;

  datePosted?: string | null;
  closingDate?: string | null;

  verificationStatus?: string | null;

  featured?: boolean;
}

type JobContext =
  | {
      type: "country-city";
      countrySlug: string;
      citySlug: string;
    }
  | {
      type: "category";
      categorySlug: string;
    }
  | {
      type: "direct";
    };

interface Props {
  job: Job;
  context: JobContext;
}

function asStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string"
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

export default function JobDetailContent({
  job,
}: Props) {
  const CategoryIcon =
    getCategoryIcon(
      job.category
    );

  const requirements =
    asStringArray(
      job.requirements
    );

  const responsibilities =
    asStringArray(
      job.responsibilities
    );

  const benefits =
    asStringArray(
      job.benefits
    );

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">

          {/* LEFT SIDEBAR */}
          <aside className="order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* JOB SUMMARY */}
              <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
                <CountryFlag
                  countryCode={
                    job.countryCode
                  }
                  country={
                    job.country
                  }
                  size="lg"
                />

                <h1 className="mt-5 text-2xl font-extrabold leading-tight text-slate-950 dark:text-white">
                  {job.title}
                </h1>

                <p className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                  {job.company}
                </p>

                {job.featured && (
                  <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Featured
                  </span>
                )}
              </div>

              {/* SALARY */}
              {job.salaryMin != null &&
                job.salaryMax != null && (
                  <div className="border-b border-slate-200 py-6 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                      Salary
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                      {job.salaryCurrency}{" "}
                      {Number(
                        job.salaryMin
                      ).toLocaleString()}{" "}
                      -{" "}
                      {Number(
                        job.salaryMax
                      ).toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.salaryPeriod ||
                        "Not specified"}
                    </p>
                  </div>
                )}

              {/* ACTIONS */}
              <div className="space-y-3 py-6">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-500"
                >
                  Apply for Job
                </a>

                <SaveJobButton
                  jobId={job.id}
                />

                {job.sourceUrl && (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View Original Source
                  </a>
                )}
              </div>

              {/* JOB DETAILS */}
              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  Job Details
                </h2>

                <div className="mt-5 space-y-5">
                  <Info label="Country">
                    <span className="inline-flex items-center gap-2">
                      <CountryFlag
                        countryCode={
                          job.countryCode
                        }
                        country={
                          job.country
                        }
                        size="sm"
                      />

                      <span>
                        {job.country}
                      </span>
                    </span>
                  </Info>

                  <Info label="City">
                    {job.city}
                  </Info>

                  <Info label="Category">
                    <span className="inline-flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      {job.category}
                    </span>
                  </Info>

                  <Info label="Employment">
                    {job.employmentType}
                  </Info>

                  <Info label="Workplace">
                    {job.workplaceType}
                  </Info>

                  <Info label="Experience">
                    {job.experienceLevel}
                  </Info>

                  <Info label="Verification">
                    {job.verificationStatus ||
                      "Not specified"}
                  </Info>

                  {job.datePosted && (
                    <Info label="Posted">
                      {job.datePosted}
                    </Info>
                  )}

                  {job.closingDate && (
                    <Info label="Closing Date">
                      {job.closingDate}
                    </Info>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="order-1 min-w-0 lg:order-2">
            <article className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* TOP TAGS */}
              <header className="border-b border-slate-200 p-7 dark:border-slate-800 sm:p-10">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <CategoryIcon className="h-4 w-4" />
                    {job.category}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.city}, {job.country}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {job.employmentType}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {job.workplaceType}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {job.experienceLevel}
                  </span>
                </div>
              </header>

              {/* REAL CONTENT */}
              <div className="p-7 sm:p-10">
                <section>
                  <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
                    Job Description
                  </h2>

                  <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600 dark:text-slate-400 sm:text-base">
                    {job.description ||
                      "No job description was provided."}
                  </p>
                </section>

                {responsibilities.length >
                  0 && (
                  <section className="mt-12">
                    <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                      Responsibilities
                    </h2>

                    <ul className="mt-5 space-y-3">
                      {responsibilities.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                            <span>
                              {item}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}

                {requirements.length >
                  0 && (
                  <section className="mt-12">
                    <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                      Requirements
                    </h2>

                    <ul className="mt-5 space-y-3">
                      {requirements.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                            <span>
                              {item}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}

                {benefits.length >
                  0 && (
                  <section className="mt-12">
                    <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                      Benefits
                    </h2>

                    <ul className="mt-5 space-y-3">
                      {benefits.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                            <span>
                              {item}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}