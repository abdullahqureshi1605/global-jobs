"use client";

import {
  useState,
} from "react";

type Analysis = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  contentType: string;
  contentLength: string;
  pageSizeBytes: number;
  title: string;
  description: string;
  canonical: string;
  h1: number;
  h2: number;
  h3: number;
  links: number;
  images: number;
  scripts: number;
  stylesheets: number;
  forms: number;
  iframes: number;
  language: string;
  robots: string;
  viewport: string;
  cacheControl: string;
  server: string;
  poweredBy: string;
  securityHeaders: {
    contentSecurityPolicy: string;
    strictTransportSecurity: string;
    xContentTypeOptions: string;
    xFrameOptions: string;
    referrerPolicy: string;
  };
  checkedAt: string;
};

function formatBytes(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
}

export default function AnalyticsPage() {
  const [url, setUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysis, setAnalysis] =
    useState<Analysis | null>(
      null
    );

  async function runAnalysis() {
    setError("");
    setAnalysis(null);

    if (!url.trim()) {
      setError(
        "Enter a page URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/analytics/analyze?url=${encodeURIComponent(
            url.trim()
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
            "Analysis failed."
        );
      }

      setAnalysis(
        result.analysis
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Admin Dashboard
          </a>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Website Analyzer
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Horizon Jobs Analytics Center
          </h1>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label
            htmlFor="analysis-url"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Horizon Jobs Page URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="analysis-url"
              value={url}
              onChange={(event) =>
                setUrl(
                  event.target.value
                )
              }
              placeholder="https://global-jobz.netlify.app/jobs"
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Page"}
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Enter a public Horizon Jobs page such as the homepage,
            jobs page, country page, category page, or career resource.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {analysis && (
          <>
            <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Metric
                label="Status"
                value={`${analysis.status}`}
              />

              <Metric
                label="Response"
                value={`${analysis.responseTimeMs} ms`}
              />

              <Metric
                label="Page Size"
                value={formatBytes(
                  analysis.pageSizeBytes
                )}
              />

              <Metric
                label="H1"
                value={`${analysis.h1}`}
              />

              <Metric
                label="H2"
                value={`${analysis.h2}`}
              />
            </section>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Panel title="Response">
                <Row
                  label="Requested URL"
                  value={
                    analysis.requestedUrl
                  }
                />

                <Row
                  label="Final URL"
                  value={
                    analysis.finalUrl
                  }
                />

                <Row
                  label="Status"
                  value={`${analysis.status} ${analysis.statusText}`}
                />

                <Row
                  label="Response Time"
                  value={`${analysis.responseTimeMs} ms`}
                />

                <Row
                  label="Content Type"
                  value={
                    analysis.contentType
                  }
                />

                <Row
                  label="Content Length"
                  value={
                    analysis.contentLength
                  }
                />
              </Panel>

              <Panel title="SEO">
                <Row
                  label="Title"
                  value={
                    analysis.title
                  }
                />

                <Row
                  label="Description"
                  value={
                    analysis.description
                  }
                />

                <Row
                  label="Canonical"
                  value={
                    analysis.canonical
                  }
                />

                <Row
                  label="H1"
                  value={`${analysis.h1}`}
                />

                <Row
                  label="H2"
                  value={`${analysis.h2}`}
                />

                <Row
                  label="H3"
                  value={`${analysis.h3}`}
                />

                <Row
                  label="Language"
                  value={
                    analysis.language
                  }
                />

                <Row
                  label="Robots"
                  value={
                    analysis.robots
                  }
                />

                <Row
                  label="Viewport"
                  value={
                    analysis.viewport
                  }
                />
              </Panel>

              <Panel title="Page Structure">
                <Row
                  label="Links"
                  value={`${analysis.links}`}
                />

                <Row
                  label="Images"
                  value={`${analysis.images}`}
                />

                <Row
                  label="Scripts"
                  value={`${analysis.scripts}`}
                />

                <Row
                  label="Stylesheets"
                  value={`${analysis.stylesheets}`}
                />

                <Row
                  label="Forms"
                  value={`${analysis.forms}`}
                />

                <Row
                  label="IFrames"
                  value={`${analysis.iframes}`}
                />
              </Panel>

              <Panel title="Server & Caching">
                <Row
                  label="Cache-Control"
                  value={
                    analysis.cacheControl
                  }
                />

                <Row
                  label="Server"
                  value={
                    analysis.server
                  }
                />

                <Row
                  label="X-Powered-By"
                  value={
                    analysis.poweredBy
                  }
                />

                <Row
                  label="Checked At"
                  value={
                    new Date(
                      analysis.checkedAt
                    ).toLocaleString()
                  }
                />
              </Panel>

              <Panel title="Security Headers">
                <Row
                  label="Content-Security-Policy"
                  value={
                    analysis
                      .securityHeaders
                      .contentSecurityPolicy
                  }
                />

                <Row
                  label="Strict-Transport-Security"
                  value={
                    analysis
                      .securityHeaders
                      .strictTransportSecurity
                  }
                />

                <Row
                  label="X-Content-Type-Options"
                  value={
                    analysis
                      .securityHeaders
                      .xContentTypeOptions
                  }
                />

                <Row
                  label="X-Frame-Options"
                  value={
                    analysis
                      .securityHeaders
                      .xFrameOptions
                  }
                />

                <Row
                  label="Referrer-Policy"
                  value={
                    analysis
                      .securityHeaders
                      .referrerPolicy
                  }
                />
              </Panel>
            </div>
          </>
        )}
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

      <p className="mt-2 break-words text-2xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </section>
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
    <div className="py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}