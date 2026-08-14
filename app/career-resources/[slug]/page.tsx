import {
  notFound,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  Clock,
} from "lucide-react";

import {
  ResourceService,
} from "@/services/resourceService";

import {
  JobService,
} from "@/services/jobService";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";

import {
  articleSchema,
  breadcrumbSchema,
} from "@/lib/seo/schema";

import {
  getSiteUrl,
} from "@/lib/seo/siteUrl";

import {
  slugify,
} from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps) {
  const { slug } = await params;

  const resource =
    await ResourceService.getResourceBySlug(
      slug
    );

  if (!resource) {
    return {
      title:
        "Resource Not Found | Horizon Jobs",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title:
      resource.seoTitle ||
      resource.title,

    description:
      resource.seoDescription ||
      resource.description,

    alternates: {
      canonical:
        `/career-resources/${resource.slug}`,
    },
  };
}

export default async function ResourcePage({
  params,
}: ResourcePageProps) {
  const { slug } = await params;

  const resource =
    await ResourceService.getResourceBySlug(
      slug
    );

  if (!resource) {
    notFound();
  }

  const [
    allResources,
    allJobs,
  ] = await Promise.all([
    ResourceService.getPublishedResources(),
    JobService.getPublishedJobs(),
  ]);

  /*
   * Related resources:
   * Same category first, then recent resources.
   */
  const relatedResources =
    allResources
      .filter(
        (item) =>
          item.id !== resource.id
      )
      .sort((a, b) => {
        const aMatch =
          a.category.toLowerCase() ===
          resource.category.toLowerCase();

        const bMatch =
          b.category.toLowerCase() ===
          resource.category.toLowerCase();

        if (aMatch && !bMatch) {
          return -1;
        }

        if (!aMatch && bMatch) {
          return 1;
        }

        return 0;
      })
      .slice(0, 3);

  /*
   * Related jobs:
   * Prefer jobs whose category matches
   * the resource category.
   */
  const relatedJobs =
    allJobs
      .filter(
        (job) =>
          job.category.toLowerCase() ===
          resource.category.toLowerCase()
      )
      .slice(0, 4);

  const siteUrl = getSiteUrl();

  const articleJsonLd =
    articleSchema({
      title:
        resource.title,

      description:
        resource.description,

      url:
        `${siteUrl}/career-resources/${resource.slug}`,

      author:
        resource.author,

      publishedDate:
        resource.publishedDate,

      updatedDate:
        resource.updatedDate,
    });

  const breadcrumbJsonLd =
    breadcrumbSchema([
      {
        name: "Home",
        url: `${siteUrl}/`,
      },

      {
        name: "Career Resources",
        url:
          `${siteUrl}/career-resources`,
      },

      {
        name: resource.category,
      },

      {
        name: resource.title,
      },
    ]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation */}
        <div className="space-y-4 mb-8">

          <BackButton
            label="Back to Career Resources"
          />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },

              {
                label: "Career Resources",
                href:
                  "/career-resources",
              },

              {
                label:
                  resource.category,
              },

              {
                label:
                  resource.title,
              },
            ]}
          />

        </div>

        {/* Article Header */}
        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-8">

          <div className="flex flex-wrap items-center gap-3 mb-5">

            <span className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              {resource.category}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {resource.readTime}
            </span>

          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            {resource.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-7 mt-5 max-w-3xl">
            {resource.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-7">

            <span>
              By {resource.author}
            </span>

            {resource.authorRole && (
              <>
                <span>•</span>

                <span>
                  {resource.authorRole}
                </span>
              </>
            )}

            {resource.publishedDate && (
              <>
                <span>•</span>

                <span>
                  Published{" "}
                  {resource.publishedDate}
                </span>
              </>
            )}

          </div>

        </header>

        {/* Top article ad */}
        <AdSlot
          slotId="resource-article-top"
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Article */}
          <section className="lg:col-span-2">

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

              <div className="prose prose-slate dark:prose-invert max-w-none">

                {resource.content
                  .split("\n")
                  .map(
                    (paragraph, index) =>
                      paragraph.trim() ? (
                        <p key={index}>
                          {paragraph}
                        </p>
                      ) : null
                  )}

              </div>

            </div>

            {/* Middle article ad */}
            <AdSlot
              slotId="resource-article-middle"
              className="my-8"
            />

          </section>

          {/* Sidebar */}
          <aside className="space-y-6">

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">

              <h2 className="font-bold text-slate-900 dark:text-white">
                Article Information
              </h2>

              <div className="space-y-4 mt-5">

                <InfoRow
                  label="Category"
                  value={
                    resource.category
                  }
                />

                <InfoRow
                  label="Read Time"
                  value={
                    resource.readTime
                  }
                />

                <InfoRow
                  label="Author"
                  value={
                    resource.author
                  }
                />

                <InfoRow
                  label="Published"
                  value={
                    resource.publishedDate
                  }
                />

              </div>

            </div>

            <div className="bg-indigo-600 text-white rounded-2xl p-6">

              <BriefcaseBusiness className="w-6 h-6 text-indigo-200" />

              <h2 className="text-lg font-bold mt-4">
                Looking for a job?
              </h2>

              <p className="text-sm text-indigo-100 leading-6 mt-2">
                Explore currently published opportunities related to your
                career area.
              </p>

              <Link
                href={`/jobs?category=${encodeURIComponent(
                  resource.category
                )}`}
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50"
              >
                Find Related Jobs
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </aside>

        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <section className="mt-12">

            <div className="flex items-end justify-between gap-4 mb-6">

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Career Opportunities
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Related Jobs
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Jobs currently available in the same career area.
                </p>
              </div>

              <Link
                href={`/jobs?category=${encodeURIComponent(
                  resource.category
                )}`}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {relatedJobs.map(
                (job) => (
                  <Link
                    key={job.id}
                    href={
                      `/jobs/${slugify(
                        job.country
                      )}/` +
                      `${slugify(
                        job.category
                      )}/` +
                      `${
                        job.slug ||
                        slugify(
                          `${job.title}-${job.company}`
                        )
                      }`
                    }
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-500/50 hover:shadow-lg transition-all"
                  >

                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {job.company}
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2">
                      {job.city},{" "}
                      {job.country}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        {job.category}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        {job.workplaceType}
                      </span>

                    </div>

                    <span className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      View Job
                      <ArrowRight className="w-4 h-4" />
                    </span>

                  </Link>
                )
              )}

            </div>

          </section>
        )}

        {/* Related Resources */}
        {relatedResources.length > 0 && (
          <section className="mt-12">

            <div className="mb-6">

              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                Keep Learning
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Related Career Resources
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Continue exploring guides related to this topic.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {relatedResources.map(
                (item) => (
                  <Link
                    key={item.id}
                    href={`/career-resources/${item.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-500/50 hover:shadow-lg transition-all"
                  >

                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                      {item.description}
                    </p>

                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </span>

                  </Link>
                )
              )}

            </div>

          </section>
        )}

        <div className="mt-12 text-center">

          <Link
            href="/career-resources"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900"
          >
            Browse All Career Resources
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                articleJsonLd
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

      </article>

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

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900 dark:text-white text-right">
        {value}
      </span>

    </div>
  );
}