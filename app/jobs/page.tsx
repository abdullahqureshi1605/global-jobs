import Link from "next/link";
import {
  BriefcaseBusiness,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { JobService } from "@/services/jobService";
import JobList from "@/components/jobs/JobList";
import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";

export const dynamic = "force-dynamic";

interface JobsPageProps {
  searchParams: Promise<{
    keyword?: string;
    location?: string;
    category?: string;
    workplace?: string;
    employmentType?: string;
    experience?: string;
    minSalary?: string;
  }>;
}

export const metadata = {
  title: "Find Jobs | Horizon Jobs",
  description:
    "Search global job opportunities by keyword, location, category, workplace type, employment type, experience level, and salary.",
};

export default async function JobsPage({
  searchParams,
}: JobsPageProps) {
  const params = await searchParams;

  const keyword =
    params.keyword?.trim() || "";

  const location =
    params.location?.trim() || "";

  const category =
    params.category?.trim() || "";

  const workplace =
    params.workplace?.trim() || "";

  const employmentType =
    params.employmentType?.trim() || "";

  const experience =
    params.experience?.trim() || "";

  const minSalary =
    params.minSalary?.trim() || "";

  const allJobs =
    await JobService.getPublishedJobs();

  const categories = Array.from(
    new Set(
      allJobs
        .map((job) => job.category)
        .filter(Boolean)
    )
  ).sort();

  const employmentTypes = Array.from(
    new Set(
      allJobs
        .map((job) => job.employmentType)
        .filter(Boolean)
    )
  ).sort();

  const experienceLevels = Array.from(
    new Set(
      allJobs
        .map((job) => job.experienceLevel)
        .filter(Boolean)
    )
  ).sort();

  const filteredJobs =
    allJobs.filter((job) => {

      const searchText = [
        job.title,
        job.company,
        job.description,
        job.category,
        job.city,
        job.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        keyword &&
        !searchText.includes(
          keyword.toLowerCase()
        )
      ) {
        return false;
      }

      const locationText = [
        job.city,
        job.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        location &&
        !locationText.includes(
          location.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        category &&
        job.category.toLowerCase() !==
          category.toLowerCase()
      ) {
        return false;
      }

      if (
        workplace &&
        job.workplaceType.toLowerCase() !==
          workplace.toLowerCase()
      ) {
        return false;
      }

      if (
        employmentType &&
        job.employmentType.toLowerCase() !==
          employmentType.toLowerCase()
      ) {
        return false;
      }

      if (
        experience &&
        job.experienceLevel.toLowerCase() !==
          experience.toLowerCase()
      ) {
        return false;
      }

      if (minSalary) {
        const minimum =
          Number(minSalary);

        if (
          Number.isFinite(minimum) &&
          (!job.salaryMax ||
            job.salaryMax < minimum)
        ) {
          return false;
        }
      }

      return true;
    });

  const hasFilters = Boolean(
    keyword ||
    location ||
    category ||
    workplace ||
    employmentType ||
    experience ||
    minSalary
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation */}
        <div className="space-y-4 mb-8">

          <BackButton label="Back" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Jobs",
              },
            ]}
          />

        </div>

        {/* Header */}
        <header className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Global Opportunities
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Find Your Next Job
          </h1>

          <p className="text-sm text-slate-500 mt-3 max-w-2xl">
            Search published opportunities by keyword, location,
            category, workplace type, employment type, experience,
            and salary.
          </p>

        </header>

        {/* Search / Filters */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-8">

          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Search & Filter Jobs
            </h2>
          </div>

          <form
            action="/jobs"
            method="GET"
            className="space-y-5"
          >

            {/* Search row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="search"
                  name="keyword"
                  defaultValue={keyword}
                  placeholder="Job title, company, keyword..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="search"
                  name="location"
                  defaultValue={location}
                  placeholder="Country or city..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

              <SelectFilter
                name="category"
                label="Category"
                value={category}
                options={categories}
              />

              <SelectFilter
                name="workplace"
                label="Workplace"
                value={workplace}
                options={[
                  "Remote",
                  "Hybrid",
                  "On-site",
                ]}
              />

              <SelectFilter
                name="employmentType"
                label="Employment"
                value={employmentType}
                options={employmentTypes}
              />

              <SelectFilter
                name="experience"
                label="Experience"
                value={experience}
                options={experienceLevels}
              />

              <input
                type="number"
                name="minSalary"
                min="0"
                defaultValue={minSalary}
                placeholder="Minimum salary"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
              >
                <Search className="w-4 h-4" />
                Search Jobs
              </button>

              {hasFilters && (
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Clear Filters
                </Link>
              )}

            </div>

          </form>

        </section>

        {/* Results */}
        <section>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {hasFilters
                  ? "Search Results"
                  : "Latest Jobs"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {filteredJobs.length} published{" "}
                {filteredJobs.length === 1
                  ? "job"
                  : "jobs"}{" "}
                found.
              </p>
            </div>

            {hasFilters && (
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Filter className="w-4 h-4" />
                Filters active
              </div>
            )}

          </div>

          {filteredJobs.length > 0 ? (
            <>
              <JobList jobs={filteredJobs} />

              <AdSlot
                slotId="jobs-results-bottom"
                className="mt-8"
              />
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">

              <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-400" />

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                No Jobs Found
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Try changing your keyword, location, category,
                workplace, or other filters.
              </p>

              <Link
                href="/jobs"
                className="inline-flex mt-5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
              >
                View All Jobs
              </Link>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

function SelectFilter({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      aria-label={label}
      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">
        {label}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}