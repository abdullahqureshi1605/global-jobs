import Link from "next/link";
import { notFound } from "next/navigation";

import { JobService } from "@/services/jobService";
import JobList from "@/components/jobs/JobList";
import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { slugify } from "@/lib/utils/slug";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  const jobs = await JobService.getPublishedJobs();

  const categoryJobs = jobs.filter(
    (job) => slugify(job.category) === category
  );

  if (categoryJobs.length === 0) {
    return {
      title: "Category Not Found | Horizon Jobs",
    };
  }

  const categoryName = categoryJobs[0].category;

  return {
    title: `${categoryName} Jobs | Horizon Jobs`,
    description: `Explore published ${categoryName} jobs and employment opportunities.`,
    alternates: {
      canonical: `/categories/${category}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  const jobs = await JobService.getPublishedJobs();

  const categoryJobs = jobs.filter(
    (job) => slugify(job.category) === category
  );

  if (categoryJobs.length === 0) {
    notFound();
  }

  const categoryName = categoryJobs[0].category;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4 mb-8">
          <BackButton label="Back to Categories" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Categories",
                href: "/categories",
              },
              {
                label: categoryName,
              },
            ]}
          />
        </div>

        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Career Area
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            {categoryName} Jobs
          </h1>

          <p className="text-slate-300 text-sm mt-3">
            {categoryJobs.length} published{" "}
            {categoryJobs.length === 1 ? "job" : "jobs"} available
            in this career category.
          </p>
        </header>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Available {categoryName} Jobs
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Select a job to view the full listing.
              </p>
            </div>
          </div>

          <JobList jobs={categoryJobs} />
        </section>

      </div>
    </main>
  );
}