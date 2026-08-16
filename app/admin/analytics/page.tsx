"use client";

import Link from "next/link";
import {
  BarChart3,
  Activity,
  Users,
  ArrowRight,
  Eye,
  Globe2,
} from "lucide-react";

import { useEffect, useState } from "react";

interface DashboardSummary {
  visitors: number;
  sessions: number;
  pageviews: number;
}

interface LiveResponse {
  count: number;
}

export default function AnalyticsHomePage() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(
      null
    );

  const [liveCount, setLiveCount] =
    useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [
          dashboardResponse,
          liveResponse,
        ] = await Promise.all([
          fetch(
            "/api/admin/analytics/dashboard",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/admin/analytics/dashboard?live=true",
            {
              cache: "no-store",
            }
          ),
        ]);

        if (
          dashboardResponse.ok
        ) {
          const result =
            await dashboardResponse.json();

          setSummary({
            visitors:
              Number(
                result.visitors ?? 0
              ),

            sessions:
              Number(
                result.sessions ?? 0
              ),

            pageviews:
              Number(
                result.pageviews ?? 0
              ),
          });
        }

        if (liveResponse.ok) {
          const result =
            (await liveResponse.json()) as LiveResponse;

          setLiveCount(
            Number(
              result.count ?? 0
            )
          );
        }
      } catch {
        // Analytics must never break the admin page.
      }
    }

    void load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
              href="/admin"
                className="inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    ← Admin Dashboard
                      </Link>
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Analytics Center
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Monitor Horizon Jobs traffic, analyze individual pages,
            and see visitors who are currently active on the website.
          </p>
        </header>

        {/* SUMMARY */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Unique Visitors"
            value={
              summary?.visitors ??
              0
            }
          />

          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="Sessions"
            value={
              summary?.sessions ??
              0
            }
          />

          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Pageviews"
            value={
              summary?.pageviews ??
              0
            }
          />

          <StatCard
            icon={<Globe2 className="h-5 w-5" />}
            label="Live Now"
            value={
              liveCount
            }
            live
          />
        </section>

        {/* TWO MAIN TOOLS */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Link
            href="/admin/analytics/page"
            className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <BarChart3 className="h-7 w-7" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              Page Analytics
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Enter any Horizon Jobs page URL and see traffic,
              unique visitors, sessions, countries, sources, devices,
              CTA clicks, SEO structure, and page performance.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge text="Traffic" />
              <Badge text="SEO" />
              <Badge text="Countries" />
              <Badge text="Sources" />
              <Badge text="FCP" />
              <Badge text="LCP" />
              <Badge text="CLS" />
              <Badge text="CSV Export" />
            </div>

            <div className="mt-7 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Open Page Analyzer →
            </div>
          </Link>

          <Link
            href="/admin/analytics/live"
            className="group rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md dark:border-emerald-900/40 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <Users className="h-7 w-7" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              Live Users
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              See who is currently active on Horizon Jobs, including
              country, approximate location, current page, browser,
              device, source, start time, and how long they have been active.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge
                text={`${liveCount} Live Now`}
                green
              />
              <Badge text="Country" />
              <Badge text="Location" />
              <Badge text="Current Page" />
              <Badge text="Time Active" />
              <Badge text="Browser" />
            </div>

            <div className="mt-7 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Open Live Users →
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  live = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  live?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          live
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Badge({
  text,
  green = false,
}: {
  text: string;
  green?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        green
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {text}
    </span>
  );
}