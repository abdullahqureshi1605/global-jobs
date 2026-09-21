"use client";

import { useEffect, useState } from "react";

type Status = {
  pending: number;
  processed: number;
  needs_review: number;
  error: number;
};

type Config = {
  provider: string;
  model: string;
  batch_limit_max: number;
  summary_max_chars: number;
  quality_threshold: number;
  originality_threshold: number;
};

export default function ProcessingAdminPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [status, setStatus] = useState<Status | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [limit, setLimit] = useState("20");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!backend) {
      setMessage("Backend URL is not configured.");
      return;
    }

    try {
      const [statusResponse, configResponse] = await Promise.all([
        fetch(`${backend}/api/processing/status`, {
          cache: "no-store",
        }),
        fetch(`${backend}/api/processing/config`, {
          cache: "no-store",
        }),
      ]);

      const statusData = await statusResponse.json();
      const configData = await configResponse.json();

      if (!statusResponse.ok || statusData.status !== "ok") {
        throw new Error(
          statusData.detail || "Processing status failed."
        );
      }

      if (!configResponse.ok || configData.status !== "ok") {
        throw new Error(
          configData.detail || "Processing configuration failed."
        );
      }

      setStatus(statusData);
      setConfig(configData);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load processing data."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const processJobs = async () => {
    if (!backend) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${backend}/api/processing/process?limit=${encodeURIComponent(limit)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(
          data.detail || "Processing batch failed."
        );
      }

      setMessage(
        `Batch complete: ${data.approved} approved, ${data.needs_review} needs review, ${data.failed} failed.`
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Processing batch failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          JOB PROCESSING
        </div>
        <h1 className="mt-2 text-3xl font-black">Processing Control</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Run live Gemini processing batches and monitor quality results.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Pending" value={status?.pending ?? "—"} />
        <Metric title="Processed" value={status?.processed ?? "—"} />
        <Metric title="Needs Review" value={status?.needs_review ?? "—"} />
        <Metric title="Errors" value={status?.error ?? "—"} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">AI Processing Engine</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Info label="Provider" value={config?.provider || "—"} />
          <Info label="Model" value={config?.model || "—"} />
          <Info
            label="Maximum Batch"
            value={config ? String(config.batch_limit_max) : "—"}
          />
          <Info
            label="Summary Limit"
            value={config ? `${config.summary_max_chars} chars` : "—"}
          />
          <Info
            label="Quality Threshold"
            value={config ? `${config.quality_threshold}/100` : "—"}
          />
          <Info
            label="Originality Threshold"
            value={config ? `${config.originality_threshold}/100` : "—"}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">Run Processing Batch</h2>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Jobs to process
            </span>

            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="1">1 job</option>
              <option value="5">5 jobs</option>
              <option value="10">10 jobs</option>
              <option value="20">20 jobs</option>
            </select>
          </label>

          <button
            onClick={processJobs}
            disabled={loading || !status?.pending}
            className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Processing with Gemini..." : "Run Live Processing"}
          </button>

          <button
            onClick={load}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold hover:bg-white/10"
          >
            Refresh Status
          </button>
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-bold text-white">
        {value}
      </div>
    </div>
  );
}
