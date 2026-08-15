import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Access Required
          </h1>

          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  const [
    jobsResult,
    resourcesResult,
    reportsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("jobs")
      .select(
        "id, status, featured",
        {
          count: "exact",
          head: false,
        }
      ),

    supabaseAdmin
      .from("resources")
      .select(
        "id, status, featured",
        {
          count: "exact",
          head: false,
        }
      ),

    supabaseAdmin
      .from("job_reports")
      .select(
        "id",
        {
          count: "exact",
          head: false,
        }
      ),
  ]);

  const jobs =
    jobsResult.data ?? [];

  const resources =
    resourcesResult.data ?? [];

  const totalReports =
    reportsResult.count ?? 0;

  const publishedJobs =
    jobs.filter(
      (job) =>
        job.status ===
        "published"
    ).length;

  const featuredJobs =
    jobs.filter(
      (job) =>
        job.status ===
          "published" &&
        Boolean(job.featured)
    ).length;

  const publishedResources =
    resources.filter(
      (resource) =>
        resource.status ===
        "published"
    ).length;

  const featuredResources =
    resources.filter(
      (resource) =>
        resource.status ===
          "published" &&
        Boolean(resource.featured)
    ).length;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Admin Dashboard
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Platform Insights
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Analytics Center
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Monitor visitor traffic and website performance using
            Google Analytics and Netlify Analytics, while keeping
            important Horizon Jobs platform metrics in one place.
          </p>
        </div>

        {/* Platform content metrics */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
            Website Content
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Published Jobs"
              value={publishedJobs}
              icon="💼"
            />

            <MetricCard
              label="Featured Jobs"
              value={featuredJobs}
              icon="⭐"
            />

            <MetricCard
              label="Published Resources"
              value={
                publishedResources
              }
              icon="📚"
            />

            <MetricCard
              label="Featured Resources"
              value={
                featuredResources
              }
              icon="✨"
            />

            <MetricCard
              label="Job Reports"
              value={totalReports}
              icon="🚩"
            />
          </div>
        </section>

        {/* Traffic analytics */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
            Traffic Analytics
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsCard
              title="Google Analytics 4"
              description="Use GA4 for detailed visitor behavior, traffic sources, page views, countries, devices, engagement, acquisition, and realtime traffic."
              icon="📊"
              buttonText="Open Google Analytics"
              href="https://analytics.google.com/"
            />

            <AnalyticsCard
              title="Netlify Analytics"
              description="Use Netlify's built-in analytics and Real User Monitoring for traffic and real-world performance data directly from your deployment."
              icon="⚡"
              buttonText="Open Netlify Analytics"
              href="https://app.netlify.com/"
            />
          </div>
        </section>

        {/* Recommended monitoring */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recommended Monitoring Setup
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep Google Analytics as the main source for detailed
                traffic and user behavior. Use Netlify Analytics for
                deployment-level traffic and real-user performance.
              </p>

              <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckItem>
                  Daily visitors
                </CheckItem>

                <CheckItem>
                  Page views
                </CheckItem>

                <CheckItem>
                  Top landing pages
                </CheckItem>

                <CheckItem>
                  Traffic sources
                </CheckItem>

                <CheckItem>
                  Countries and devices
                </CheckItem>

                <CheckItem>
                  Engagement and user behavior
                </CheckItem>

                <CheckItem>
                  Real-user performance
                </CheckItem>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Performance Rule
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
                Analytics must never become a dependency for rendering
                the public website.
              </p>
            </div>
          </div>
        </section>

        {/* Important note */}
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
            Traffic analytics themselves are provided by the external
            analytics platforms. This admin page is your central launch
            point and website-content dashboard; it does not duplicate
            every visitor event in Supabase.
          </p>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <span className="text-2xl">
          {icon}
        </span>

        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function AnalyticsCard({
  title,
  description,
  icon,
  buttonText,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  href: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 min-h-[96px] text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        {buttonText}
        <span className="ml-2">
          ↗
        </span>
      </a>
    </div>
  );
}

function CheckItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        ✓
      </span>

      <span>{children}</span>
    </div>
  );
}