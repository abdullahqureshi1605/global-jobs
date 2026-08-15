"use client";

import {
  useEffect,
  useState,
} from "react";

type LiveVisitor = {
  session_hash: string;
  last_seen: string;
  page_path: string | null;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  is_bot: boolean;
  displayLocation: string;
};

type CountRow = {
  name: string;
  count: number;
};

type DashboardData = {
  visitors: number;
  sessions: number;
  pageviews: number;

  countries: CountRow[];
  pages: CountRow[];
  sources: CountRow[];
  devices: CountRow[];
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
      contentType: string;
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

  return `${Math.round(value)} ms`;
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function AnalyticsPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [liveVisitors, setLiveVisitors] =
    useState<LiveVisitor[]>([]);

  const [pageUrl, setPageUrl] =
    useState("");

  const [pageReport, setPageReport] =
    useState<PageReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [pageError, setPageError] =
    useState("");

  async function loadDashboard() {
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

      const dashboard =
        await dashboardResponse.json();

      const live =
        await liveResponse.json();

      if (dashboardResponse.ok) {
        setData({
          visitors:
            Number(
              dashboard.visitors ?? 0
            ),
          sessions:
            Number(
              dashboard.sessions ?? 0
            ),
          pageviews:
            Number(
              dashboard.pageviews ?? 0
            ),

          countries: (
            dashboard.countries ?? []
          ).map(
            (item: {
              country: string;
              count: number;
            }) => ({
              name: item.country,
              count: Number(
                item.count
              ),
            })
          ),

          pages: (
            dashboard.pages ?? []
          ).map(
            (item: {
              page: string;
              count: number;
            }) => ({
              name: item.page,
              count: Number(
                item.count
              ),
            })
          ),

          sources: (
            dashboard.sources ?? []
          ).map(
            (item: {
              source: string;
              count: number;
            }) => ({
              name: item.source,
              count: Number(
                item.count
              ),
            })
          ),

          devices: (
            dashboard.devices ?? []
          ).map(
            (item: {
              device: string;
              count: number;
            }) => ({
              name: item.device,
              count: Number(
                item.count
              ),
            })
          ),
        });
      }

      if (liveResponse.ok) {
        setLiveVisitors(
          live.visitors ?? []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load analytics:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzePage() {
    setPageError("");
    setPageReport(null);

    if (!pageUrl.trim()) {
      setPageError(
        "Enter a Horizon Jobs page URL."
      );
      return;
    }

    setPageLoading(true);

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

      setPageReport(
        result as PageReport
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Page analysis failed."
      );
    } finally {
      setPageLoading(false);
    }
  }

  function exportPageCsv() {
    if (!pageReport) {
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
        String(value ?? ""),
      ]);
    };

    const analysis =
      pageReport.page.analysis;

    add(
      "Page",
      "URL",
      pageReport.page.url
    );

    add(
      "Page",
      "Path",
      pageReport.page.path
    );

    add(
      "SEO",
      "Title",
      analysis.title
    );

    add(
      "SEO",
      "Description",
      analysis.description
    );

    add(
      "SEO",
      "Canonical",
      analysis.canonical
    );

    add(
      "SEO",
      "Robots",
      analysis.robots
    );

    add(
      "SEO",
      "Language",
      analysis.language
    );

    add(
      "SEO",
      "Viewport",
      analysis.viewport
    );

    add(
      "Structure",
      "H1",
      analysis.h1
    );

    add(
      "Structure",
      "H2",
      analysis.h2
    );

    add(
      "Structure",
      "H3",
      analysis.h3
    );

    add(
      "Structure",
      "Links",
      analysis.links
    );

    add(
      "Structure",
      "Images",
      analysis.images
    );

    add(
      "Structure",
      "Scripts",
      analysis.scripts
    );

    add(
      "Structure",
      "Stylesheets",
      analysis.stylesheets
    );

    add(
      "Performance",
      "HTTP Status",
      analysis.status
    );

    add(
      "Performance",
      "Response Time",
      analysis.responseTimeMs
    );

    add(
      "Performance",
      "Page Size",
      formatBytes(
        analysis.pageSizeBytes
      )
    );

    add(
      "Traffic",
      "Pageviews",
      pageReport.traffic.pageviews
    );

    add(
      "Traffic",
      "Unique Visitors",
      pageReport.traffic.uniqueVisitors
    );

    add(
      "Traffic",
      "Sessions",
      pageReport.traffic.sessions
    );

    add(
      "Traffic",
      "Paid Sessions",
      pageReport.traffic.paidSessions
    );

    add(
      "Traffic",
      "CTA Clicks",
      pageReport.traffic.ctaClicks
    );

    add(
      "Traffic",
      "Apply Clicks",
      pageReport.traffic.applyClicks
    );

    add(
      "Traffic",
      "Report Clicks",
      pageReport.traffic.reportClicks
    );

    add(
      "Behavior",
      "Average Time On Page",
      pageReport.traffic.avgTimeOnPage
    );

    add(
      "Behavior",
      "Average Scroll Depth",
      pageReport.traffic.avgScrollDepth
    );

    for (const item of pageReport.countries) {
      add(
        "Country",
        item.name,
        item.count
      );
    }

    for (const item of pageReport.sources) {
      add(
        "Source",
        item.name,
        item.count
      );
    }

    for (const item of pageReport.devices) {
      add(
        "Device",
        item.name,
        item.count
      );
    }

    for (const item of pageReport.browsers) {
      add(
        "Browser",
        item.name,
        item.count
      );
    }

    for (const item of pageReport.operatingSystems) {
      add(
        "Operating System",
        item.name,
        item.count
      );
    }

    for (const item of pageReport.cta) {
      add(
        "CTA",
        item.name,
        item.count
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

    const objectUrl =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = objectUrl;

    link.download =
      `horizon-jobs-page-report-${
        pageReport.page.path
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          ) || "home"
      }.csv`;

    link.click();

    URL.revokeObjectURL(
      objectUrl
    );
  }

  useEffect(() => {
    void loadDashboard();

    const interval =
      window.setInterval(
        () => {
          void loadDashboard();
        },
        15_000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* PAGE ANALYZER */}
        <section className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Page Analyzer
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                Analyze Any Horizon Jobs Page
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Enter a page URL to inspect its traffic, visitors,
                sources, SEO structure, and performance.
              </p>
            </div>

            <button
              type="button"
              onClick={
                exportPageCsv
              }
              disabled={
                !pageReport
              }
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export Page CSV
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={pageUrl}
              onChange={(event) =>
                setPageUrl(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  void analyzePage();
                }
              }}
              placeholder="https://global-jobz.netlify.app/jobs"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="button"
              onClick={() =>
                void analyzePage()
              }
              disabled={
                pageLoading
              }
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pageLoading
                ? "Analyzing..."
                : "Analyze Page"}
            </button>
          </div>

          {pageError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {pageError}
            </div>
          )}

          {pageReport && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Analyzed Page
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-900 dark:text-white">
                  {pageReport.page.url}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                  label="Pageviews"
                  value={
                    pageReport.traffic.pageviews
                  }
                />

                <Metric
                  label="Unique Visitors"
                  value={
                    pageReport.traffic.uniqueVisitors
                  }
                />

                <Metric
                  label="Sessions"
                  value={
                    pageReport.traffic.sessions
                  }
                />

                <Metric
                  label="Paid Sessions"
                  value={
                    pageReport.traffic.paidSessions
                  }
                />

                <Metric
                  label="CTA Clicks"
                  value={
                    pageReport.traffic.ctaClicks
                  }
                />

                <Metric
                  label="Apply Clicks"
                  value={
                    pageReport.traffic.applyClicks
                  }
                />

                <Metric
                  label="Avg Time"
                  value={formatMs(
                    pageReport.traffic.avgTimeOnPage
                  )}
                />

                <Metric
                  label="Avg Scroll"
                  value={`${Math.round(
                    pageReport.traffic.avgScrollDepth
                  )}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                  label="Response"
                  value={formatMs(
                    pageReport.page.analysis
                      .responseTimeMs
                  )}
                />

                <Metric
                  label="Page Size"
                  value={formatBytes(
                    pageReport.page.analysis
                      .pageSizeBytes
                  )}
                />

                <Metric
                  label="H1"
                  value={
                    pageReport.page.analysis.h1
                  }
                />

                <Metric
                  label="H2"
                  value={
                    pageReport.page.analysis.h2
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Table
                  title="Countries"
                  rows={
                    pageReport.countries
                  }
                />

                <Table
                  title="Traffic Sources"
                  rows={
                    pageReport.sources
                  }
                />

                <Table
                  title="Devices"
                  rows={
                    pageReport.devices
                  }
                />

                <Table
                  title="Browsers"
                  rows={
                    pageReport.browsers
                  }
                />

                <Table
                  title="Operating Systems"
                  rows={
                    pageReport.operatingSystems
                  }
                />

                <Table
                  title="CTA Clicks"
                  rows={
                    pageReport.cta
                  }
                />
              </div>

              <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  SEO & Page Structure
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Info
                    label="Title"
                    value={
                      pageReport.page.analysis
                        .title ||
                      "Missing"
                    }
                  />

                  <Info
                    label="Description"
                    value={
                      pageReport.page.analysis
                        .description ||
                      "Missing"
                    }
                  />

                  <Info
                    label="Canonical"
                    value={
                      pageReport.page.analysis
                        .canonical ||
                      "Missing"
                    }
                  />

                  <Info
                    label="Robots"
                    value={
                      pageReport.page.analysis
                        .robots ||
                      "Missing"
                    }
                  />

                  <Info
                    label="H3"
                    value={
                      pageReport.page.analysis.h3
                    }
                  />

                  <Info
                    label="Images"
                    value={
                      pageReport.page.analysis.images
                    }
                  />

                  <Info
                    label="Links"
                    value={
                      pageReport.page.analysis.links
                    }
                  />

                  <Info
                    label="Scripts"
                    value={
                      pageReport.page.analysis.scripts
                    }
                  />
                </div>
              </section>
            </div>
          )}
        </section>

        {/* LIVE VISITORS */}
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Live Visitors
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Active visitors seen within the last 60 seconds.
              </p>
            </div>

            <div className="text-4xl font-extrabold text-emerald-600">
              {liveVisitors.length}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {liveVisitors.length ===
            0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-slate-800">
                No live visitors detected.
              </div>
            ) : (
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Country
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Location
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Page
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Device
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Browser
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Timezone
                    </th>
                    <th className="px-3 py-3 text-xs uppercase text-slate-500">
                      Source
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {liveVisitors.map(
                    (
                      visitor
                    ) => (
                      <tr
                        key={
                          visitor.session_hash
                        }
                      >
                        <td className="px-3 py-4 text-sm font-semibold">
                          {visitor.country_code ||
                            "Unknown"}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {visitor.displayLocation ||
                            "Unknown"}
                        </td>

                        <td className="max-w-[260px] truncate px-3 py-4 text-sm">
                          {visitor.page_path ||
                            "/"}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {visitor.device_type ||
                            "Unknown"}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {visitor.browser ||
                            "Unknown"}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {visitor.timezone ||
                            "Unknown"}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {visitor.utm_source ||
                            "Direct"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* OVERALL */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Loading analytics...
          </div>
        ) : data ? (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Metric
                label="Unique Visitors"
                value={
                  data.visitors
                }
              />

              <Metric
                label="Sessions"
                value={
                  data.sessions
                }
              />

              <Metric
                label="Pageviews"
                value={
                  data.pageviews
                }
              />

              <Metric
                label="Live Now"
                value={
                  liveVisitors.length
                }
              />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Table
                title="Visitors by Country"
                rows={
                  data.countries
                }
              />

              <Table
                title="Traffic Sources"
                rows={
                  data.sources
                }
              />

              <Table
                title="Top Pages"
                rows={
                  data.pages
                }
              />

              <Table
                title="Devices"
                rows={
                  data.devices
                }
              />
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
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
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function Table({
  title,
  rows,
}: {
  title: string;
  rows: CountRow[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      {rows.length ===
      0 ? (
        <p className="p-6 text-sm text-slate-500">
          No data available.
        </p>
      ) : (
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map(
                (row) => (
                  <tr
                    key={
                      row.name
                    }
                  >
                    <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {row.name}
                    </td>

                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                      {row.count.toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}