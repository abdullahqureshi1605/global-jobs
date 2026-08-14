import { notFound } from "next/navigation";

import { JobService } from "@/services/jobService";
import { countries } from "@/data/countries";
import { categories } from "@/data/categories";

import JobList from "@/components/jobs/JobList";
import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

import { createCategoryMetadata } from "@/lib/seo";

interface CategoryJobsPageProps {
  params: Promise<{
    country: string;
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryJobsPageProps) {
  const { country, category } = await params;

  const countryData = countries.find(
    (item) => item.slug === country
  );

  const categoryData = categories.find(
    (item) => item.slug === category
  );

  if (!countryData || !categoryData) {
    return {
      title: "Jobs Not Found | Horizon Jobs",
      description:
        "The requested country or job category could not be found.",
    };
  }

  return createCategoryMetadata(
    countryData.name,
    countryData.slug,
    categoryData.name,
    categoryData.slug
  );
}

export default async function CategoryJobsPage({
  params,
}: CategoryJobsPageProps) {
  const { country, category } = await params;

  const countryData = countries.find(
    (item) => item.slug === country
  );

  const categoryData = categories.find(
    (item) => item.slug === category
  );

  if (!countryData || !categoryData) {
    notFound();
  }

  // Get jobs for this country first.
  // JobService returns a Promise, so we must await it.
  const countryJobs = await JobService.getJobsByCountry(
    countryData.name
  );

  // Then filter those jobs by category.
  const jobs = countryJobs.filter(
    (job) =>
      job.category.toLowerCase() ===
      categoryData.name.toLowerCase()
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back + Breadcrumbs */}
        <div className="space-y-4 mb-8">

          <BackButton label="Back to Countries" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Countries",
                href: "/countries",
              },
              {
                label: countryData.name,
                href: `/jobs/${countryData.slug}`,
              },
              {
                label: categoryData.name,
              },
            ]}
          />

        </div>

        {/* Page Header */}
        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            {countryData.name}
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            {categoryData.name} Jobs
          </h1>

          <p className="max-w-3xl text-slate-300 text-sm leading-relaxed mt-4">
            {categoryData.description}
          </p>

          <p className="text-sm text-slate-400 mt-3">
            Browse{" "}
            {categoryData.name.toLowerCase()}{" "}
            opportunities in{" "}
            {countryData.name}.
          </p>

        </header>

        {/* Job Results */}
        <section>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {categoryData.name} Jobs in{" "}
              {countryData.name}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {jobs.length} published{" "}
              {jobs.length === 1
                ? "position"
                : "positions"}{" "}
              found.
            </p>
          </div>

          {jobs.length > 0 ? (
            <JobList jobs={jobs} />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                No Jobs Found
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                There are currently no published{" "}
                {categoryData.name.toLowerCase()} jobs in{" "}
                {countryData.name}.
              </p>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}