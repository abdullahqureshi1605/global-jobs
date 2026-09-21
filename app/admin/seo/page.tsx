"use client";

import { useEffect, useState } from "react";

export default function SEOAdminPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `${backend}/api/admin-ops/seo/audit`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || result.status !== "ok") {
          throw new Error(result.detail || "SEO audit failed.");
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load SEO audit."
        );
      }
    }

    load();
  }, [backend]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          SEARCH
        </div>
        <h1 className="mt-2 text-3xl font-black">SEO</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Live audit of published job content and SEO readiness.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Metric
              label="Published Jobs"
              value={data.published_jobs}
            />
            <Metric
              label="Average SEO Score"
              value={data.average_seo_score}
            />
            <Metric
              label="Issues"
              value={data.issues.length}
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-black">
              Published Content Audit
            </h2>

            {data.issues.length === 0 ? (
              <div className="mt-5 text-sm text-emerald-300">
                No SEO issues detected in published content.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {data.issues.map((issue: any, index: number) => (
                  <div
                    key={`${issue.job_id}-${index}`}
                    className="rounded-xl bg-white/[0.04] p-4"
                  >
                    <div className="font-bold">
                      {issue.title || issue.job_id}
                    </div>

                    <div className="mt-1 text-sm text-amber-300">
                      {issue.issue}
                    </div>

                    {issue.score !== undefined && (
                      <div className="mt-1 text-xs text-slate-500">
                        Score: {issue.score}/100
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}
