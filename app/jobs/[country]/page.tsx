import Link from "next/link";
import { notFound } from "next/navigation";

import { JobService } from "@/services/jobService";
import JobList from "@/components/jobs/JobList";
import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { slugify } from "@/lib/utils/slug";

interface CountryPageProps {
  params: Promise<{
    country: string;
  }>;
}

export async function generateMetadata({
  params,
}: CountryPageProps) {
  const { country } = await params;

  const jobs = await JobService.getPublishedJobs();

  const countryJobs = jobs.filter(
    (job) => slugify(job.country) === country
  );

  if (countryJobs.length === 0) {
    return {
      title: "Country Jobs | Horizon Jobs",
      description:
        "Explore international job opportunities by country.",
    };
  }

  const countryName = countryJobs[0].country;

  return {
    title: `Jobs in ${countryName} | Horizon Jobs`,
    description: `Explore published job opportunities in ${countryName}.`,
    alternates: {
      canonical: `/jobs/${country}`,
    },
  };
}

export default async function CountryJobsPage({
  params,
}: CountryPageProps) {
  const { country } = await params;

  const jobs = await JobService.getPublishedJobs();

  const countryJobs = jobs.filter(
    (job) => slugify(job.country) === country
  );

  if (countryJobs.length === 0) {
    notFound();
  }

  const countryName = countryJobs[0].country;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation */}
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
                label: countryName,
              },
            ]}
          />

        </div>

        {/* Page Header */}
        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Global Employment
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            Jobs in {countryName}
          </h1>

          <p className="text-sm text-slate-300 mt-3">
            {countryJobs.length} published{" "}
            {countryJobs.length === 1
              ? "job"
              : "jobs"}{" "}
            currently available in {countryName}.
          </p>

        </header>

        {/* Job Results */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Latest Jobs in {countryName}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Browse all currently published opportunities in{" "}
                {countryName}.
              </p>
            </div>

          </div>

          <JobList jobs={countryJobs} />
        </section>

      </div>
    </main>
  );
}