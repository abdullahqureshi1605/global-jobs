"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type DashboardData = {
  summary: {
    pageviews?: number;
    uniqueVisitors?: number;
    sessions?: number;
    pagesPerSession?: number;
    bounceRate?: number;
    ctaClicks?: number;
    applyClicks?: number;
    reportClicks?: number;
    jobViews?: number;
    resourceViews?: number;
    paidSessions?: number;
    avgLoadMs?: number;
    avgFcpMs?: number;
    avgLcpMs?: number;
    avgCls?: number;
    avgTimeOnPage?: number;
    avgScrollDepth?: number;
  };

  daily: Array<{
    date: string;
    pageviews: number;
    uniqueVisitors: number;
    sessions: number;
  }>;

  countries: Array<{
    country: string;
    code: string;
    pageviews: number;
    uniqueVisitors: number;
  }>;

  sources: Array<{
    source: string;
    medium: string;
    campaign: string;
    pageviews: number;
    sessions: number;
  }>;

  pages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
  }>;

  landingPages: Array<{
    path: string;
    visits: number;
  }>;

  events: Array<{
    event: string;
    count: number;
  }>;

  cta: Array<{
    label: string;
    target: string;
    count: number;
  }>;

  devices: Array<{
    device: string;
    count: number;
  }>;

  browsers: Array<{
    browser: string;
    count: number;
  }>;

  operatingSystems: Array<{
    os: string;
    count: number;
  }>;
};

const ranges = [
  {
    label: "Today",
    days: 1,
  },
  {
    label: "7 Days",
    days: 7,
  },
  {
    label: "30 Days",
    days: 30,
  },
  {
    label: "90 Days",
    days: 90,
  },
  {
    label: "1 Year",
    days: 365,
  },
];

function formatNumber(
  value: number | undefined
) {
  return (
    value ?? 0
  ).toLocaleString();
}

function formatMs(
  value: number | undefined
) {
  if (!value) {
    return "—";
  }

  return `${Math.round(
    value
  )} ms`;
}

function formatPercent(
  value: number | undefined
) {
  return `${(
    value ?? 0
  ).toFixed(1)}%`;
}

function formatDate(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

export default function AnalyticsPage() {
  const [range, setRange] =
    useState(30);

  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState("");

  async function loadAnalytics(
    selectedDays = range
  ) {
    setLoading(true);
    setError("");

    try {
      const end =
        new Date();

      const start =
        new Date(
          end.getTime() -
            (selectedDays - 1) *
              24 *
              60 *
              60 *
              1000
        );

      const response =
        await fetch(
          `/api/admin/analytics/dashboard?start=${formatDate(
            start
          )}&end=${formatDate(
            end
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
            "Failed to load analytics."
        );
      }

      setData(
        result.data
      );

      setLastUpdated(
        new Date().toLocaleTimeString()
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics(
      range
    );

    const interval =
      window.setInterval(
        () => {
          void loadAnalytics(
            range
          );
        },
        60_000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [range]);

  const maxDailyViews =
    useMemo(() => {
      if (
        !data?.daily.length
      ) {
        return 1;
      }

      return Math.max(
        ...data.daily.map(
          (item) =>
            item.pageviews
        ),
        1
      );
    }, [data]);

  function exportCsv() {
    if (!data) {
      return;
    }

    const rows: string[][] =
      [
        [
          "Section",
          "Item",
          "Metric",
          "Value",
        ],
      ];

    for (const item of data.daily) {
      rows.push([
        "Daily",
        item.date,
        "Pageviews",
        String(
          item.pageviews
        ),
      ]);

      rows.push([
        "Daily",
        item.date,
        "Unique Visitors",
        String(
          item.uniqueVisitors
        ),
      ]);
    }

    for (const item of data.countries) {
      rows.push([
        "Country",
        item.country,
        "Pageviews",
        String(
          item.pageviews
        ),
      ]);

      rows.push([
        "Country",
        item.country,
        "Unique Visitors",
        String(
          item.uniqueVisitors
        ),
      ]);
    }

    for (const item of data.sources) {
      rows.push([
        "Traffic Source",
        item.source,
        "Sessions",
        String(
          item.sessions
        ),
      ]);
    }

    for (const item of data.pages) {
      rows.push([
        "Page",
        item.path,
        "Views",
        String(
          item.views
        ),
      ]);
    }

    for (const item of data.cta) {
      rows.push([
        "CTA",
        item.label,
        "Clicks",
        String(
          item.count
        ),
      ]);
    }

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (cell) =>
                  `"${cell
                    .replaceAll(
                      '"',
                      '""'
                    )}"`
              )
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      `horizon-jobs-analytics-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  const summary =
    data?.summary || {};

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Internal Analytics
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Horizon Jobs Analytics
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Traffic, visitors, countries, campaigns, CTA activity,
                job activity, device usage, and performance data collected
                for Horizon Jobs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  loadAnalytics(
                    range
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={
                  exportCsv
                }
                disabled={!data}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-2">
            {ranges.map(
              (item) => (
                <button
                  key={
                    item.days
                  }
                  type="button"
                  onClick={() =>
                    setRange(
                      item.days
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    range ===
                    item.days
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          {lastUpdated && (
            <p className="mt-3 text-xs text-slate-500">
              Last updated{" "}
              {lastUpdated}
              {" · "}
              Automatically refreshes every 60 seconds.
            </p>
          )}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Loading analytics...
          </div>
        ) : data ? (
          <>
            <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Metric
                label="Unique Visitors"
                value={formatNumber(
                  summary.uniqueVisitors
                )}
              />

              <Metric
                label="Pageviews"
                value={formatNumber(
                  summary.pageviews
                )}
              />

              <Metric
                label="Sessions"
                value={formatNumber(
                  summary.sessions
                )}
              />

              <Metric
                label="Pages / Session"
                value={(
                  summary.pagesPerSession ??
                  0
                ).toFixed(2)}
              />

              <Metric
                label="Bounce Rate"
                value={formatPercent(
                  summary.bounceRate
                )}
              />

              <Metric
                label="PPC Sessions"
                value={formatNumber(
                  summary.paidSessions
                )}
              />

              <Metric
                label="CTA Clicks"
                value={formatNumber(
                  summary.ctaClicks
                )}
              />

              <Metric
                label="Apply Clicks"
                value={formatNumber(
                  summary.applyClicks
                )}
              />
            </section>

            <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Metric
                label="Job Views"
                value={formatNumber(
                  summary.jobViews
                )}
              />

              <Metric
                label="Resource Views"
                value={formatNumber(
                  summary.resourceViews
                )}
              />

              <Metric
                label="Report Clicks"
                value={formatNumber(
                  summary.reportClicks
                )}
              />

              <Metric
                label="Avg Time on Page"
                value={formatMs(
                  summary.avgTimeOnPage
                )}
              />
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Traffic Over Time
              </h2>

              <div className="mt-6 space-y-3">
                {data.daily
                  .slice(-30)
                  .map(
                    (item) => (
                      <div
                        key={
                          item.date
                        }
                        className="grid grid-cols-[80px_1fr_70px] items-center gap-3 text-sm"
                      >
                        <span className="text-xs text-slate-500">
                          {item.date.slice(
                            5
                          )}
                        </span>

                        <div className="h-7 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-lg bg-indigo-500"
                            style={{
                              width: `${Math.max(
                                2,
                                (item.pageviews /
                                  maxDailyViews) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatNumber(
                            item.pageviews
                          )}
                        </span>
                      </div>
                    )
                  )}
              </div>
            </section>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DataTable
                title="Countries"
                columns={[
                  "Country",
                  "Visitors",
                  "Views",
                ]}
                rows={data.countries.map(
                  (item) => [
                    `${item.country} ${
                      item.code
                        ? `(${item.code})`
                        : ""
                    }`,
                    formatNumber(
                      item.uniqueVisitors
                    ),
                    formatNumber(
                      item.pageviews
                    ),
                  ]
                )}
              />

              <DataTable
                title="Traffic Sources / PPC"
                columns={[
                  "Source",
                  "Medium",
                  "Sessions",
                ]}
                rows={data.sources.map(
                  (item) => [
                    item.source,
                    item.medium,
                    formatNumber(
                      item.sessions
                    ),
                  ]
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DataTable
                title="Top Pages"
                columns={[
                  "Page",
                  "Views",
                  "Visitors",
                ]}
                rows={data.pages.map(
                  (item) => [
                    item.path,
                    formatNumber(
                      item.views
                    ),
                    formatNumber(
                      item.uniqueVisitors
                    ),
                  ]
                )}
              />

              <DataTable
                title="Landing Pages"
                columns={[
                  "Page",
                  "Visits",
                ]}
                rows={data.landingPages.map(
                  (item) => [
                    item.path,
                    formatNumber(
                      item.visits
                    ),
                  ]
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DataTable
                title="CTA Performance"
                columns={[
                  "CTA",
                  "Target",
                  "Clicks",
                ]}
                rows={data.cta.map(
                  (item) => [
                    item.label,
                    item.target ||
                      "—",
                    formatNumber(
                      item.count
                    ),
                  ]
                )}
              />

              <DataTable
                title="Events"
                columns={[
                  "Event",
                  "Count",
                ]}
                rows={data.events.map(
                  (item) => [
                    item.event,
                    formatNumber(
                      item.count
                    ),
                  ]
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <DataTable
                title="Devices"
                columns={[
                  "Device",
                  "Visitors",
                ]}
                rows={data.devices.map(
                  (item) => [
                    item.device,
                    formatNumber(
                      item.count
                    ),
                  ]
                )}
              />

              <DataTable
                title="Browsers"
                columns={[
                  "Browser",
                  "Visitors",
                ]}
                rows={data.browsers.map(
                  (item) => [
                    item.browser,
                    formatNumber(
                      item.count
                    ),
                  ]
                )}
              />

              <DataTable
                title="Operating Systems"
                columns={[
                  "OS",
                  "Visitors",
                ]}
                rows={data.operatingSystems.map(
                  (item) => [
                    item.os,
                    formatNumber(
                      item.count
                    ),
                  ]
                )}
              />
            </div>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Website Performance
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Metric
                  label="Avg Page Load"
                  value={formatMs(
                    summary.avgLoadMs
                  )}
                />

                <Metric
                  label="Avg FCP"
                  value={formatMs(
                    summary.avgFcpMs
                  )}
                />

                <Metric
                  label="Avg LCP"
                  value={formatMs(
                    summary.avgLcpMs
                  )}
                />

                <Metric
                  label="Avg CLS"
                  value={(
                    summary.avgCls ??
                    0
                  ).toFixed(3)}
                />
              </div>
            </section>
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
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="max-h-[420px] overflow-auto">
        {rows.length ===
        0 ? (
          <p className="p-6 text-sm text-slate-500">
            No data for this period.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
              <tr>
                {columns.map(
                  (column) => (
                    <th
                      key={
                        column
                      }
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {column}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map(
                (
                  row,
                  index
                ) => (
                  <tr
                    key={
                      index
                    }
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    {row.map(
                      (
                        cell,
                        cellIndex
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="max-w-xs truncate px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                          title={
                            cell
                          }
                        >
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}