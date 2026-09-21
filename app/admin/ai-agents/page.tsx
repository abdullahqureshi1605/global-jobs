"use client";

import { useEffect, useState } from "react";

type Config = {
  provider: string;
  model: string;
  batch_limit_max: number;
  summary_max_chars: number;
  quality_threshold: number;
  originality_threshold: number;
};

type Status = {
  pending: number;
  processed: number;
  needs_review: number;
  error: number;
};

export default function AIAgentsPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!backend) {
      setError("Backend URL is not configured.");
      return;
    }

    Promise.all([
      fetch(`${backend}/api/processing/config`, {
        cache: "no-store",
      }).then((r) => r.json()),
      fetch(`${backend}/api/processing/status`, {
        cache: "no-store",
      }).then((r) => r.json()),
    ])
      .then(([configData, statusData]) => {
        if (configData.status !== "ok") {
          throw new Error(configData.detail || "AI configuration failed.");
        }

        if (statusData.status !== "ok") {
          throw new Error(statusData.detail || "AI status failed.");
        }

        setConfig(configData);
        setStatus(statusData);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load AI agent status."
        );
      });
  }, [backend]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          AI OPERATIONS
        </div>

        <h1 className="mt-2 text-3xl font-black">
          AI Agents
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Live status of the Gemini-powered content processing agent.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Content Processing Agent
            </h2>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              LIVE
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <Row label="Provider" value={config?.provider || "—"} />
            <Row label="Model" value={config?.model || "—"} />
            <Row
              label="Max summary"
              value={
                config ? `${config.summary_max_chars} characters` : "—"
              }
            />
            <Row
              label="Quality gate"
              value={
                config ? `${config.quality_threshold}/100` : "—"
              }
            />
            <Row
              label="Originality gate"
              value={
                config ? `${config.originality_threshold}/100` : "—"
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-black">
            Current Workload
          </h2>

          <div className="mt-6 space-y-3">
            <Row
              label="Pending"
              value={String(status?.pending ?? "—")}
            />
            <Row
              label="Processed"
              value={String(status?.processed ?? "—")}
            />
            <Row
              label="Needs review"
              value={String(status?.needs_review ?? "—")}
            />
            <Row
              label="Errors"
              value={String(status?.error ?? "—")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl bg-white/[0.04] p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[65%] break-words text-right text-sm font-bold text-white">
        {value}
      </span>
    </div>
  );
}
