"use client";

import { useEffect, useState } from "react";

export default function MaintenanceAdminPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setRefreshing(true);

      const response = await fetch(
        `${backend}/api/admin-ops/maintenance/health`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || result.status !== "ok") {
        throw new Error(
          result.detail || "Maintenance check failed."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load maintenance health."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [backend]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
            SYSTEM
          </div>
          <h1 className="mt-2 text-3xl font-black">
            Maintenance
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Live infrastructure and service configuration checks.
          </p>
        </div>

        <button
          onClick={load}
          disabled={refreshing}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold hover:bg-white/10 disabled:opacity-50"
        >
          {refreshing ? "Checking..." : "Refresh Health"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {data && (
        <>
          <div
            className={`rounded-2xl border p-5 ${
              data.overall === "ok"
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-amber-400/20 bg-amber-400/10"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">
              Overall system state
            </div>
            <div className="mt-2 text-2xl font-black">
              {data.overall}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(data.checks).map(
              ([name, check]: [string, any]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black capitalize">
                      {name}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        check.status === "ok" ||
                        check.status === "configured"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-500">
                    {JSON.stringify(check, null, 2)}
                  </pre>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
