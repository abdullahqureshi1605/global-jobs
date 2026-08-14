import Link from "next/link";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { getSiteUrl } from "@/lib/seo/siteUrl";

export const metadata = {
  title: "About Horizon Jobs | Global Job Discovery Platform",
  description:
    "Learn about Horizon Jobs, our job discovery platform, content standards, source transparency, and commitment to useful career information.",
};

export default function AboutPage() {
  const siteUrl = getSiteUrl();

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4 mb-8">
          <BackButton label="Back" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "About",
              },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            About Horizon Jobs
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold mt-3">
            A simpler way to discover global opportunities.
          </h1>

          <p className="text-slate-300 leading-relaxed mt-5 max-w-3xl">
            Horizon Jobs is a global job discovery platform designed to
            organize employment opportunities and practical career resources
            into one clear, easy-to-use destination.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10 mb-8">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Purpose
          </h2>

          <div className="space-y-5 text-sm leading-7 text-slate-600 dark:text-slate-400 mt-5">

            <p>
              Finding work online can be unnecessarily difficult. Job seekers
              often have to move between multiple websites, search engines,
              company pages, and career resources before they can understand
              whether an opportunity is relevant.
            </p>

            <p>
              Horizon Jobs is built to make that discovery process easier.
              We organize published opportunities by country, category,
              employment type, workplace type, and other useful attributes.
            </p>

            <p>
              Our goal is not to replace the original employer or job source.
              Instead, we help users discover opportunities and then direct
              them to the original application source.
            </p>

          </div>
        </section>

        {/* How it works */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-indigo-600 font-bold text-sm">
              01
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
              Discover
            </h2>

            <p className="text-sm text-slate-500 leading-6 mt-2">
              Search opportunities by keyword, location, country, category,
              and workplace type.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-indigo-600 font-bold text-sm">
              02
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
              Review
            </h2>

            <p className="text-sm text-slate-500 leading-6 mt-2">
              Review the available job information, source details,
              requirements, and employment conditions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-indigo-600 font-bold text-sm">
              03
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
              Apply
            </h2>

            <p className="text-sm text-slate-500 leading-6 mt-2">
              When an opportunity looks suitable, follow the original
              application link provided with the listing.
            </p>
          </div>

        </section>

        {/* Standards */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10 mb-8">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Content Standards
          </h2>

          <div className="space-y-5 mt-5">

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Source transparency
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-6">
                Job listings should include source and application information
                whenever that information is available.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Useful information
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-6">
                Career resources are intended to provide practical information
                rather than simply repeat generic promotional content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Corrections
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-6">
                Users can report inaccurate, expired, broken, or suspicious
                listings through our reporting system.
              </p>
            </div>

          </div>
        </section>

        {/* Transparency */}
        <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Important Transparency Notice
          </h2>

          <p className="text-sm text-slate-500 leading-7 mt-4">
            Horizon Jobs is a job discovery platform. We are not the employer
            for the vacancies listed on the platform unless explicitly stated.
            Applications may be handled by employers, recruitment companies,
            or the original job source.
          </p>

          <p className="text-sm text-slate-500 leading-7 mt-4">
            We do not charge applicants a fee simply to discover jobs through
            Horizon Jobs.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">

            <Link
              href="/jobs"
              className="inline-flex px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
            >
              Explore Jobs
            </Link>

            <Link
              href="/career-resources"
              className="inline-flex px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Career Resources
            </Link>

          </div>

          <p className="text-xs text-slate-400 mt-6">
            Platform: {siteUrl}
          </p>

        </section>

      </div>
    </main>
  );
}