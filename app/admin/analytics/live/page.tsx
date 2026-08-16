"use client";

import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  MapPin,
  Clock3,
  Globe2,
  MonitorSmartphone,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type LiveVisitor = {
  session_hash: string;
  last_seen: string;
  started_at?: string;
  page_path: string | null;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system:
    | string
    | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  is_bot: boolean;
  displayLocation: string;
};

function formatDuration(
  seconds: number
) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remaining}s`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const mins =
    minutes % 60;

  return `${hours}h ${mins}m`;
}

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString();
}

export default function LiveUsersPage() {
  const [visitors, setVisitors] =
    useState<LiveVisitor[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(
      new Date()
    );

  const [countryFilter, setCountryFilter] =
    useState("");

  const [pageFilter, setPageFilter] =
    useState("");

  async function loadLive() {
    try {
      const response =
        await fetch(
          "/api/admin/analytics/dashboard?live=true",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load live visitors."
        );
      }

      const result =
        await response.json();

      setVisitors(
        result.visitors ??
          []
      );

      setLastUpdated(
        new Date()
      );
    } catch (error) {
      console.error(
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLive();

    const timer =
      window.setInterval(
        () => {
          void loadLive();
        },
        10_000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  const countries =
    useMemo(
      () =>
        Array.from(
          new Set(
            visitors
              .map(
                (visitor) =>
                  visitor.country_name ||
                  visitor.country_code ||
                  ""
              )
              .filter(Boolean)
          )
        ).sort(),
      [visitors]
    );

  const filteredVisitors =
    visitors.filter(
      (visitor) => {
        const country =
          (
            visitor.country_name ||
            visitor.country_code ||
            ""
          ).toLowerCase();

        const page =
          (
            visitor.page_path ||
            ""
          ).toLowerCase();

        return (
          country.includes(
            countryFilter.toLowerCase()
          ) &&
          page.includes(
            pageFilter.toLowerCase()
          )
        );
      }
    );

  const averageActiveTime =
    filteredVisitors.length
      ? Math.round(
          filteredVisitors.reduce(
            (
              total,
              visitor
            ) =>
              total +
              Math.max(
                0,
                (
                  Date.now() -
                  new Date(
                    visitor.started_at ||
                      visitor.last_seen
                  ).getTime()
                ) / 1000
              ),
            0
          ) /
            filteredVisitors.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Analytics Center
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />

              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Live Users
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Visitors active within approximately the last 60 seconds.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadLive()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Summary
            icon={
              <Users className="h-5 w-5" />
            }
            label="Live Visitors"
            value={
              filteredVisitors.length
            }
          />

          <Summary
            icon={
              <Globe2 className="h-5 w-5" />
            }
            label="Countries"
            value={
              countries.length
            }
          />

          <Summary
            icon={
              <Clock3 className="h-5 w-5" />
            }
            label="Avg Active Time"
            value={formatDuration(
              averageActiveTime
            )}
          />

          <Summary
            icon={
              <MonitorSmartphone className="h-5 w-5" />
            }
            label="Last Updated"
            value={formatTime(
              lastUpdated.toISOString()
            )}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="country-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Filter by Country
              </label>

              <select
                id="country-filter"
                value={
                  countryFilter
                }
                onChange={(event) =>
                  setCountryFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">
                  All Countries
                </option>

                {countries.map(
                  (country) => (
                    <option
                      key={
                        country
                      }
                      value={
                        country
                      }
                    >
                      {
                        country
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="page-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Filter by Page
              </label>

              <input
                id="page-filter"
                value={
                  pageFilter
                }
                onChange={(event) =>
                  setPageFilter(
                    event.target.value
                  )
                }
                placeholder="/jobs/pakistan"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Current Visitors
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredVisitors.length} visitor
              {filteredVisitors.length ===
              1
                ? ""
                : "s"}{" "}
              shown.
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading live visitors...
              </div>
            ) : filteredVisitors.length ===
              0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No live visitors match the current filters.
              </div>
            ) : (
              <table className="w-full min-w-[1200px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Country
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Current Page
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Active Time
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Started
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Last Seen
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Device
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Browser
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Source
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-slate-500">
                      Type
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVisitors.map(
                    (
                      visitor
                    ) => {
                      const started =
                        new Date(
                          visitor.started_at ||
                            visitor.last_seen
                        );

                      const activeSeconds =
                        Math.max(
                          0,
                          Math.round(
                            (
                              Date.now() -
                              started.getTime()
                            ) /
                              1000
                          )
                        );

                      return (
                        <tr
                          key={
                            visitor.session_hash
                          }
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {visitor.country_code ||
                              "—"}
                            <span className="ml-2 text-slate-500">
                              {
                                visitor.country_name
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />

                              {visitor.displayLocation ||
                                "Unknown"}
                            </div>
                          </td>

                          <td className="max-w-[260px] truncate px-5 py-4 text-sm text-indigo-600 dark:text-indigo-400">
                            {visitor.page_path ||
                              "/"}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-emerald-600">
                            {formatDuration(
                              activeSeconds
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatTime(
                              visitor.started_at ||
                                visitor.last_seen
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatTime(
                              visitor.last_seen
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {visitor.device_type ||
                              "Unknown"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {visitor.browser ||
                              "Unknown"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {visitor.utm_source ||
                              "Direct"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                visitor.is_bot
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {visitor.is_bot
                                ? "Bot"
                                : "Human"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Summary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
        {typeof value ===
        "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}