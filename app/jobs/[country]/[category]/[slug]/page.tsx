import { notFound } from "next/navigation";

import {
  JobService,
} from "@/services/jobService";

import {
  slugify,
} from "@/lib/utils/slug";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";

import {
  generateJobPostingSchema,
} from "@/lib/seo/jobSchema";

import {
  breadcrumbSchema,
} from "@/lib/seo/schema";

import {
  getSiteUrl,
} from "@/lib/seo/siteUrl";

interface JobPageProps {
  params: Promise<{
    country: string;
    category: string;
    slug: string;
  }>;
}

async function findJob(
  countrySlug: string,
  categorySlug: string,
  jobSlug: string
) {
  const jobs =
    await JobService.getPublishedJobs();

  return jobs.find((job) => {
    const countryMatches =
      slugify(job.country) ===
      countrySlug;

    const categoryMatches =
      slugify(job.category) ===
      categorySlug;

    const actualSlug =
      job.slug ||
      slugify(
        `${job.title}-${job.company}`
      );

    return (
      countryMatches &&
      categoryMatches &&
      actualSlug === jobSlug
    );
  });
}

export async function generateMetadata({
  params,
}: JobPageProps) {
  const {
    country,
    category,
    slug,
  } = await params;

  const job = await findJob(
    country,
    category,
    slug
  );

  if (!job) {
    return {
      title:
        "Job Not Found | Horizon Jobs",

      description:
        "The requested job could not be found.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();

  return {
    title:
      `${job.title} at ${job.company} | Horizon Jobs`,

    description:
      job.description,

    alternates: {
      canonical:
        `${siteUrl}/jobs/${country}/${category}/${slug}`,
    },
  };
}

export default async function JobPage({
  params,
}: JobPageProps) {
  const {
    country,
    category,
    slug,
  } = await params;

  const job = await findJob(
    country,
    category,
    slug
  );

  if (!job) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const jobSchema =
    generateJobPostingSchema(job);

  const breadcrumbJsonLd =
    breadcrumbSchema([
      {
        name: "Home",
        url: `${siteUrl}/`,
      },

      {
        name: "Jobs",
        url: `${siteUrl}/jobs`,
      },

      {
        name: job.country,
        url:
          `${siteUrl}/jobs/` +
          `${slugify(job.country)}`,
      },

      {
        name: job.category,
        url:
          `${siteUrl}/categories/` +
          `${slugify(job.category)}`,
      },

      {
        name: job.title,
      },
    ]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4 mb-8">

          <BackButton label="Back to Jobs" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },

              {
                label: "Jobs",
                href: "/jobs",
              },

              {
                label: job.country,
                href:
                  `/jobs/${slugify(
                    job.country
                  )}`,
              },

              {
                label: job.category,
                href:
                  `/categories/${slugify(
                    job.category
                  )}`,
              },

              {
                label: job.title,
              },
            ]}
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <article className="lg:col-span-2 space-y-8">

            <header className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">

              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {job.company}
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                {job.title}
              </h1>

              <p className="text-sm text-slate-500 mt-3">
                {job.city}, {job.country}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">

                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  {job.employmentType}
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  {job.workplaceType}
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  {job.experienceLevel}
                </span>

              </div>

            </header>

            <AdSlot
              slotId="job-detail-top"
            />

            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Job Description
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 whitespace-pre-wrap">
                {job.description}
              </p>

              {job.responsibilities?.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
                    Responsibilities
                  </h2>

                  <ul className="mt-4 space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
                    {job.responsibilities.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}

              {job.requirements?.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
                    Requirements
                  </h2>

                  <ul className="mt-4 space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
                    {job.requirements.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}

              {job.benefits?.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
                    Benefits
                  </h2>

                  <ul className="mt-4 space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
                    {job.benefits.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}

            </section>

            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">

              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
              >
                Apply for this job
              </a>

              <p className="text-xs text-slate-500 mt-3">
                You will be redirected to the original
                application source.
              </p>

            </section>

          </article>

          <aside>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">

              <h2 className="font-bold text-slate-900 dark:text-white">
                Job Information
              </h2>

              <div className="space-y-4 mt-5 text-sm">

                <InfoRow
                  label="Company"
                  value={job.company}
                />

                <InfoRow
                  label="Country"
                  value={job.country}
                />

                <InfoRow
                  label="City"
                  value={job.city}
                />

                <InfoRow
                  label="Category"
                  value={job.category}
                />

                <InfoRow
                  label="Posted"
                  value={job.datePosted}
                />

                {job.closingDate && (
                  <InfoRow
                    label="Closing"
                    value={job.closingDate}
                  />
                )}

                <InfoRow
                  label="Verification"
                  value={
                    job.verificationStatus
                  }
                />

              </div>

            </div>

          </aside>

        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                jobSchema
              ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                breadcrumbJsonLd
              ),
          }}
        />

      </div>

    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900 dark:text-white text-right">
        {value}
      </span>

    </div>
  );
}