"use client";

import {
  Activity,
  ArrowLeft,
  Download,
  Search,
  Gauge,
  Users,
  Eye,
  MousePointerClick,
  Globe2,
  Smartphone,
  Code2,
  FileText,
  Timer,
  Zap,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

type CountRow = {
  name: string;
  count: number;
};

type PageReport = {
  page: {
    url: string;
    path: string;

    analysis: {
      status: number;
      statusText: string;
      responseTimeMs: number;
      pageSizeBytes: number;
      title: string;
      description: string;
      canonical: string;
      language: string;
      viewport: string;
      robots: string;
      h1: number;
      h2: number;
      h3: number;
      links: number;
      images: number;
      scripts: number;
      stylesheets: number;
      forms: number;
    };
  };

  traffic: {
    pageviews: number;
    uniqueVisitors: number;
    sessions: number;
    pagesPerSession: number;
    paidSessions: number;
    ctaClicks: number;
    applyClicks: number;
    reportClicks: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;

    avgLoad: number;
    avgFcp: number;
    avgLcp: number;
    avgCls: number;
  };

  countries: CountRow[];
  sources: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
  cta: CountRow[];
};

function formatMs(value: number) {
  if (!value) {
    return "—";
  }

  return `${Math.round(
    value
  )} ms`;
}

function formatBytes(value: number) {
  if (
    value <
    1024
  ) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    1024 /
    1024
  ).toFixed(2)} MB`;
}

function csvEscape(
  value: unknown
) {
  return `"${String(
    value ?? ""
  ).replaceAll(
    '"',
    '""'
  )}"`;
}

export default function PageAnalyticsPage() {
  const [pageUrl, setPageUrl] =
    useState("");

  const [report, setReport] =
    useState<PageReport | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function analyze() {
    setError("");
    setReport(null);

    if (
      !pageUrl.trim()
    ) {
      setError(
        "Enter a Horizon Jobs page URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/analytics/page-report?url=${encodeURIComponent(
            pageUrl.trim()
          )}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Page analysis failed."
        );
      }

      setReport(
        result
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Page analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!report) {
      return;
    }

    const rows: string[][] = [];

    const add = (
      section: string,
      metric: string,
      value: unknown
    ) => {
      rows.push([
        section,
        metric,
        String(
          value ?? ""
        ),
      ]);
    };

    const a =
      report.page.analysis;

    const t =
      report.traffic;

    add(
      "Page",
      "URL",
      report.page.url
    );

    add(
      "Page",
      "Path",
      report.page.path
    );

    add(
      "SEO",
      "Title",
      a.title
    );

    add(
      "SEO",
      "Description",
      a.description
    );

    add(
      "SEO",
      "Canonical",
      a.canonical
    );

    add(
      "SEO",
      "Robots",
      a.robots
    );

    add(
      "SEO",
      "Language",
      a.language
    );

    add(
      "Structure",
      "H1",
      a.h1
    );

    add(
      "Structure",
      "H2",
      a.h2
    );

    add(
      "Structure",
      "H3",
      a.h3
    );

    add(
      "Structure",
      "Links",
      a.links
    );

    add(
      "Structure",
      "Images",
      a.images
    );

    add(
      "Structure",
      "Scripts",
      a.scripts
    );

    add(
      "Performance",
      "Average Page Load",
      formatMs(
        t.avgLoad
      )
    );

    add(
      "Performance",
      "Average FCP",
      formatMs(
        t.avgFcp
      )
    );

    add(
      "Performance",
      "Average LCP",
      formatMs(
        t.avgLcp
      )
    );

    add(
      "Performance",
      "Average CLS",
      t.avgCls.toFixed(
        3
      )
    );

    add(
      "Performance",
      "Server Response",
      formatMs(
        a.responseTimeMs
      )
    );

    add(
      "Performance",
      "Page Size",
      formatBytes(
        a.pageSizeBytes
      )
    );

    add(
      "Traffic",
      "Pageviews",
      t.pageviews
    );

    add(
      "Traffic",
      "Unique Visitors",
      t.uniqueVisitors
    );

    add(
      "Traffic",
      "Sessions",
      t.sessions
    );

    add(
      "Traffic",
      "Pages / Session",
      t.pagesPerSession.toFixed(
        2
      )
    );

    add(
      "Traffic",
      "Paid Sessions",
      t.paidSessions
    );

    add(
      "Behavior",
      "Average Time On Page",
      formatMs(
        t.avgTimeOnPage
      )
    );

    add(
      "Behavior",
      "Average Scroll Depth",
      `${Math.round(
        t.avgScrollDepth
      )}%`
    );

    add(
      "Engagement",
      "CTA Clicks",
      t.ctaClicks
    );

    add(
      "Engagement",
      "Apply Clicks",
      t.applyClicks
    );

    add(
      "Engagement",
      "Report Clicks",
      t.reportClicks
    );

    for (const row of report.countries) {
      add(
        "Countries",
        row.name,
        row.count
      );
    }

    for (const row of report.sources) {
      add(
        "Sources",
        row.name,
        row.count
      );
    }

    for (const row of report.devices) {
      add(
        "Devices",
        row.name,
        row.count
      );
    }

    for (const row of report.browsers) {
      add(
        "Browsers",
        row.name,
        row.count
      );
    }

    for (const row of report.operatingSystems) {
      add(
        "Operating Systems",
        row.name,
        row.count
      );
    }

    for (const row of report.cta) {
      add(
        "CTA",
        row.name,
        row.count
      );
    }

    const csv = [
      [
        "Section",
        "Metric",
        "Value",
      ],
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(csvEscape)
            .join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href = url;

    anchor.download =
      `horizon-page-report-${
        report.page.path
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          ) || "home"
      }.csv`;

    anchor.click();

    URL.revokeObjectURL(
      url
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
                className="inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    ← Admin Dashboard
                      </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Analytics Center
            </Link>

            <h1 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
              Page Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Analyze one Horizon Jobs page at a time.
            </p>
          </div>

          <button
            type="button"
            onClick={
              exportCsv
            }
            disabled={
              !report
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label
            htmlFor="page-url"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Horizon Jobs page URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="page-url"
              value={pageUrl}
              onChange={(e) =>
                setPageUrl(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  void analyze();
                }
              }}
              placeholder="https://horizonjobs.online/jobs"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="button"
              onClick={() =>
                void analyze()
              }
              disabled={
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {loading
                ? "Analyzing..."
                : "Analyze Page"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {report && (
          <div className="mt-8 space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Analyzed Page
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900 dark:text-white">
                {report.page.url}
              </p>
            </section>

            {/* TRAFFIC */}
            <section>
              <SectionTitle
                icon={
                  <Users className="h-5 w-5" />
                }
                title="Traffic"
              />

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                  label="Pageviews"
                  value={
                    report.traffic.pageviews
                  }
                />

                <Metric
                  label="Unique Visitors"
                  value={
                    report.traffic.uniqueVisitors
                  }
                />

                <Metric
                  label="Sessions"
                  value={
                    report.traffic.sessions
                  }
                />

                <Metric
                  label="Paid Sessions"
                  value={
                    report.traffic.paidSessions
                  }
                />
              </div>
            </section>

            {/* ENGAGEMENT */}
            <section>
              <SectionTitle
                icon={
                  <MousePointerClick className="h-5 w-5" />
                }
                title="Engagement"
              />

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                  label="CTA Clicks"
                  value={
                    report.traffic.ctaClicks
                  }
                />

                <Metric
                  label="Apply Clicks"
                  value={
                    report.traffic.applyClicks
                  }
                />

                <Metric
                  label="Report Clicks"
                  value={
                    report.traffic.reportClicks
                  }
                />

                <Metric
                  label="Scroll Depth"
                  value={`${Math.round(
                    report.traffic.avgScrollDepth
                  )}%`}
                />
              </div>
            </section>

            {/* PERFORMANCE */}
            <section>
              <SectionTitle
                icon={
                  <Gauge className="h-5 w-5" />
                }
                title="Performance"
              />

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                  icon={
                    <Timer className="h-4 w-4" />
                  }
                  label="Average Page Load"
                  value={formatMs(
                    report.traffic.avgLoad
                  )}
                />

                <Metric
                  icon={
                    <Zap className="h-4 w-4" />
                  }
                  label="Average FCP"
                  value={formatMs(
                    report.traffic.avgFcp
                  )}
                />

                <Metric
                  icon={
                    <Gauge className="h-4 w-4" />
                  }
                  label="Average LCP"
                  value={formatMs(
                    report.traffic.avgLcp
                  )}
                />

                <Metric
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                  label="Average CLS"
                  value={report.traffic.avgCls.toFixed(
                    3
                  )}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <Metric
                  label="Server Response"
                  value={formatMs(
                    report.page.analysis
                      .responseTimeMs
                  )}
                />

                <Metric
                  label="Page Size"
                  value={formatBytes(
                    report.page.analysis
                      .pageSizeBytes
                  )}
                />

                <Metric
                  label="Average Time on Page"
                  value={formatMs(
                    report.traffic
                      .avgTimeOnPage
                  )}
                />
              </div>
            </section>

            {/* SEO */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <SectionTitle
                icon={
                  <FileText className="h-5 w-5" />
                }
                title="SEO & Page Structure"
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  label="Title"
                  value={
                    report.page.analysis
                      .title ||
                    "Missing"
                  }
                />

                <Info
                  label="Description"
                  value={
                    report.page.analysis
                      .description ||
                    "Missing"
                  }
                />

                <Info
                  label="Canonical"
                  value={
                    report.page.analysis
                      .canonical ||
                    "Missing"
                  }
                />

                <Info
                  label="Robots"
                  value={
                    report.page.analysis
                      .robots ||
                    "Missing"
                  }
                />

                <Info
                  label="H1"
                  value={
                    report.page.analysis
                      .h1
                  }
                />

                <Info
                  label="H2"
                  value={
                    report.page.analysis
                      .h2
                  }
                />

                <Info
                  label="H3"
                  value={
                    report.page.analysis
                      .h3
                  }
                />

                <Info
                  label="Images"
                  value={
                    report.page.analysis
                      .images
                  }
                />
              </div>
            </section>

            {/* BREAKDOWNS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Breakdown
                title="Countries"
                rows={
                  report.countries
                }
              />

              <Breakdown
                title="Traffic Sources"
                rows={
                  report.sources
                }
              />

              <Breakdown
                title="Devices"
                rows={
                  report.devices
                }
              />

              <Breakdown
                title="Browsers"
                rows={
                  report.browsers
                }
              />

              <Breakdown
                title="Operating Systems"
                rows={
                  report.operatingSystems
                }
              />

              <Breakdown
                title="CTA Performance"
                rows={
                  report.cta
                }
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
        {icon}
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
        {typeof value ===
        "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: CountRow[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      {rows.length ===
      0 ? (
        <p className="p-6 text-sm text-slate-500">
          No data available.
        </p>
      ) : (
        <div className="max-h-80 overflow-auto">
          {rows.map(
            (row) => (
              <div
                key={
                  row.name
                }
                className="flex items-center justify-between border-b border-slate-100 px-6 py-3 last:border-0 dark:border-slate-800"
              >
                <span className="truncate pr-4 text-sm text-slate-700 dark:text-slate-300">
                  {row.name}
                </span>

                <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                  {row.count.toLocaleString()}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}