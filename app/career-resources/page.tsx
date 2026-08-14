import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";

import {
  ResourceService,
} from "@/services/resourceService";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Career Resources | Horizon Jobs",
  description:
    "Practical career guides covering job searching, resumes, interviews, remote work, international careers, and professional development.",
};

export default async function CareerResourcesPage() {
  const resources =
    await ResourceService.getPublishedResources();

  const featuredResources =
    resources
      .filter(
        (resource) =>
          resource.featured
      )
      .slice(0, 3);

  const latestResources =
    resources.slice(0, 12);

  const featuredIds = new Set(
    featuredResources.map(
      (resource) => resource.id
    )
  );

  const latestNonFeatured =
    latestResources.filter(
      (resource) =>
        !featuredIds.has(
          resource.id
        )
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
                label: "Career Resources",
              },
            ]}
          />

        </div>

        {/* Hero */}
        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10">

          <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Career Knowledge
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold mt-3">
            Career Resources
          </h1>

          <p className="text-slate-300 leading-7 mt-5 max-w-3xl">
            Practical guides to help you search for jobs, improve your
            applications, prepare for interviews, understand remote work,
            and navigate international career opportunities.
          </p>

        </header>

        {/* Featured */}
        {featuredResources.length > 0 && (
          <section className="mb-12">

            <div className="flex items-end justify-between gap-4 mb-6">

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Editor's Selection
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Featured Resources
                </h2>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {featuredResources.map(
                (resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    featured
                  />
                )
              )}

            </div>

          </section>
        )}

        {/* Ad */}
        <AdSlot
          slotId="resources-directory-top"
          className="mb-10"
        />

        {/* Latest */}
        <section>

          <div className="flex items-end justify-between gap-4 mb-6">

            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                Latest Knowledge
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Latest Career Resources
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                New guides and articles published by Horizon Jobs.
              </p>
            </div>

          </div>

          {latestNonFeatured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {latestNonFeatured.map(
                (resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                  />
                )
              )}

            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">

              <BookOpen className="w-10 h-10 mx-auto text-slate-400" />

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                Resources Coming Soon
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                New career guides will appear here after publication.
              </p>

            </div>
          ) : null}

        </section>

        {/* Empty featured + latest case */}
        {resources.length > 0 &&
          featuredResources.length === 0 &&
          latestNonFeatured.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
              <p className="text-sm text-slate-500">
                No published resources are available right now.
              </p>
            </div>
          )}

      </div>

    </main>
  );
}

function ResourceCard({
  resource,
  featured = false,
}: {
  resource: {
    id: string;
    slug: string;
    title: string;
    category: string;
    description: string;
    author: string;
    readTime: string;
  };
  featured?: boolean;
}) {
  return (
    <article
      className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-xl transition-all ${
        featured
          ? "md:p-7"
          : ""
      }`}
    >

      <div className="flex items-center justify-between gap-3">

        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          {resource.category}
        </span>

        {featured && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Sparkles className="w-3.5 h-3.5" />
            Featured
          </span>
        )}

      </div>

      <h3
        className={`font-bold text-slate-900 dark:text-white mt-5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
          featured
            ? "text-xl"
            : "text-lg"
        }`}
      >
        {resource.title}
      </h3>

      <p className="text-sm text-slate-500 leading-6 mt-3 line-clamp-3">
        {resource.description}
      </p>

      <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">

        <div className="flex items-center gap-3 text-xs text-slate-500">

          <span>
            By {resource.author}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {resource.readTime}
          </span>

        </div>

        <Link
          href={`/career-resources/${resource.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
        >
          Read
          <ArrowRight className="w-4 h-4" />
        </Link>

      </div>

    </article>
  );
}