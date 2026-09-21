"use client";

import { useEffect, useState } from "react";

type Stats = {
  total: number;
  pending: number;
  processed: number;
  needs_review: number;
  error: number;
};

type RecentJob = {
  id: string;
  title: string;
  company_name: string | null;
  location_display: string | null;
  country_code: string;
  processing_status: string;
  created_at: string | null;
};

export default function AdzunaAdminPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [country, setCountry] = useState("gb");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("20");
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const loadStats = async () => {
    if (!backend) {
      setMessage("Backend URL is not configured.");
      return;
    }

    try {
      const response = await fetch(
        `${backend}/api/adzuna/stats?country=${encodeURIComponent(country)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.detail || "Unable to load Adzuna stats.");
      }

      setStats(data.counts);
      setRecent(data.recent || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load Adzuna stats."
      );
    }
  };

  useEffect(() => {
    loadStats();
  }, [country]);

  const testConnection = async () => {
    if (!backend) return;

    setTesting(true);
    setMessage("");
    setTestResult(null);

    try {
      const response = await fetch(
        `${backend}/api/adzuna/test?country=${encodeURIComponent(country)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.detail || "Adzuna test failed.");
      }

      setTestResult(data);
      setMessage("Adzuna connection test successful.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Adzuna connection test failed."
      );
    } finally {
      setTesting(false);
    }
  };

  const importJobs = async () => {
    if (!backend) return;

    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams({
        country,
        page,
        results_per_page: limit,
      });

      if (what.trim()) params.set("what", what.trim());
      if (where.trim()) params.set("where", where.trim());

      const response = await fetch(
        `${backend}/api/adzuna/import?${params.toString()}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Adzuna import failed.");
      }

      setMessage(
        `Import complete: ${data.inserted ?? 0} inserted, ${data.updated ?? 0} updated, ${data.failed ?? 0} failed.`
      );

      await loadStats();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Adzuna import failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          SOURCE CONTROL
        </div>
        <h1 className="mt-2 text-3xl font-black">Adzuna Control</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Run live Adzuna imports and monitor the raw job ingestion pipeline.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Imported" value={stats?.total ?? "—"} />
        <Metric title="Pending" value={stats?.pending ?? "—"} />
        <Metric title="Processed" value={stats?.processed ?? "—"} />
        <Metric title="Errors" value={stats?.error ?? "—"} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Live Adzuna Connection</h2>
            <p className="mt-1 text-sm text-slate-500">
              Test the real API connection before importing jobs.
            </p>
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {testResult?.sample && (
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Live sample received
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {testResult.sample.title}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {testResult.sample.company?.display_name || "Company not provided"}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">Import Jobs</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Country">
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="gb"
            />
          </Field>

          <Field label="Page">
            <input
              type="number"
              min="1"
              value={page}
              onChange={(e) => setPage(e.target.value)}
            />
          </Field>

          <Field label="Results">
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </Field>

          <Field label="What">
            <input
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="vehicle technician"
            />
          </Field>

          <Field label="Where">
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="London"
            />
          </Field>
        </div>

        <button
          onClick={importJobs}
          disabled={loading}
          className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
        >
          {loading ? "Importing live jobs..." : "Import Live Jobs"}
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Recent Imported Jobs</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest raw records in Supabase.
            </p>
          </div>

          <button
            onClick={loadStats}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Job</th>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Country</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((job) => (
                <tr key={job.id} className="border-b border-white/5">
                  <td className="px-3 py-4 font-bold text-white">
                    {job.title}
                  </td>
                  <td className="px-3 py-4 text-slate-400">
                    {job.company_name || "—"}
                  </td>
                  <td className="px-3 py-4 text-slate-400">
                    {job.location_display || "—"}
                  </td>
                  <td className="px-3 py-4 uppercase text-slate-400">
                    {job.country_code}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold">
                      {job.processing_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!recent.length && (
            <div className="py-8 text-center text-sm text-slate-500">
              No imported jobs found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-slate-950 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_input]:focus:border-cyan-400 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/10 [&_select]:bg-slate-950 [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:text-white [&_select]:outline-none">
        {children}
      </span>
    </label>
  );
}
