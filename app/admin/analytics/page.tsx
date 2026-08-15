"use client";

import {
  useEffect,
  useState,
} from "react";

type Analysis = {
  url: string;
  title: string;
  description: string;
  canonical: string;
  h1: number;
  h2: number;
  h3: number;
  links: number;
  images: number;
  brokenImages: number;
  resourceCount: number;
  jsCount: number;
  cssCount: number;
  imageCount: number;
  fontCount: number;
  transferBytes: number;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  viewport: string;
  connection: string;
  downlink: string;
  rtt: string;
  memory: string;
  online: boolean;
  analyzedAt: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  let size = bytes;
  let unit = 0;

  while (
    size >= 1024 &&
    unit < units.length - 1
  ) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(
    unit === 0 ? 0 : 1
  )} ${units[unit]}`;
}

function formatMs(value: number) {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  return `${Math.round(value)} ms`;
}

export default function AnalyticsPage() {
  const [url, setUrl] =
    useState("");

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      typeof window !==
      "undefined"
    ) {
      setUrl(
        window.location.origin
      );
    }
  }, []);

  async function analyze() {
    setError("");
    setLoading(true);

    try {
      const parsed =
        new URL(url.trim());

      if (
        parsed.origin !==
        window.location.origin
      ) {
        throw new Error(
          "Only Horizon Jobs pages on this deployment can be analyzed."
        );
      }

      const iframe =
        document.getElementById(
          "website-analyzer-frame"
        ) as HTMLIFrameElement | null;

      if (
        !iframe ||
        !iframe.contentWindow ||
        !iframe.contentDocument
      ) {
        throw new Error(
          "Load the page in the analyzer first."
        );
      }

      const win =
        iframe.contentWindow;

      const doc =
        iframe.contentDocument;

      const navigation =
        win.performance.getEntriesByType(
          "navigation"
        )[0] as
          | PerformanceNavigationTiming
          | undefined;

      const resources =
        win.performance.getEntriesByType(
          "resource"
        ) as PerformanceResourceTiming[];

      const paints =
        win.performance.getEntriesByType(
          "paint"
        );

      const firstPaintEntry =
        paints.find(
          (entry) =>
            entry.name ===
            "first-paint"
        );

      const fcpEntry =
        paints.find(
          (entry) =>
            entry.name ===
            "first-contentful-paint"
        );

      const images =
        Array.from(
          doc.images
        );

      const scripts =
        resources.filter(
          (item) =>
            item.initiatorType ===
            "script"
        );

      const styles =
        resources.filter(
          (item) =>
            item.initiatorType ===
              "css" ||
            item.name.endsWith(
              ".css"
            )
        );

      const imageResources =
        resources.filter(
          (item) =>
            item.initiatorType ===
              "img" ||
            /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(
              item.name
            )
        );

      const fonts =
        resources.filter(
          (item) =>
            item.initiatorType ===
              "font" ||
            /\.(woff2?|ttf|otf)(\?|$)/i.test(
              item.name
            )
        );

      const transferBytes =
        resources.reduce(
          (total, item) =>
            total +
            (item.transferSize ||
              item.encodedBodySize ||
              0),
          0
        );

      const connection =
        (
          win.navigator as Navigator & {
            connection?: {
              effectiveType?: string;
              downlink?: number;
              rtt?: number;
            };
          }
        ).connection;

      const memory =
        (
          win.navigator as Navigator & {
            deviceMemory?: number;
          }
        ).deviceMemory;

      const result: Analysis = {
        url: win.location.href,

        title:
          doc.title ||
          "Missing",

        description:
          doc
            .querySelector(
              'meta[name="description"]'
            )
            ?.getAttribute(
              "content"
            ) ||
          "Missing",

        canonical:
          doc
            .querySelector(
              'link[rel="canonical"]'
            )
            ?.getAttribute(
              "href"
            ) ||
          "Missing",

        h1:
          doc.querySelectorAll(
            "h1"
          ).length,

        h2:
          doc.querySelectorAll(
            "h2"
          ).length,

        h3:
          doc.querySelectorAll(
            "h3"
          ).length,

        links:
          doc.querySelectorAll(
            "a"
          ).length,

        images:
          images.length,

        brokenImages:
          images.filter(
            (image) =>
              image.complete &&
              image.naturalWidth === 0
          ).length,

        resourceCount:
          resources.length,

        jsCount:
          scripts.length,

        cssCount:
          styles.length,

        imageCount:
          imageResources.length,

        fontCount:
          fonts.length,

        transferBytes,

        loadTime:
          navigation?.loadEventEnd ||
          0,

        domContentLoaded:
          navigation?.domContentLoadedEventEnd ||
          0,

        firstPaint:
          firstPaintEntry?.startTime ||
          0,

        firstContentfulPaint:
          fcpEntry?.startTime ||
          0,

        viewport:
          `${win.innerWidth} × ${win.innerHeight}`,

        connection:
          connection?.effectiveType ||
          "Unknown",

        downlink:
          connection?.downlink !==
          undefined
            ? `${connection.downlink} Mbps`
            : "Unknown",

        rtt:
          connection?.rtt !==
          undefined
            ? `${connection.rtt} ms`
            : "Unknown",

        memory:
          memory !== undefined
            ? `${memory} GB`
            : "Unknown",

        online:
          win.navigator.onLine,

        analyzedAt:
          new Date().toISOString(),
      };

      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze page."
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

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Measure your website directly from the browser without adding
            visitor analytics requests to your public pages.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={url}
              onChange={(event) =>
                setUrl(
                  event.target.value
                )
              }
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="https://global-jobz.netlify.app/jobs"
            />

            <button
              type="button"
              onClick={() => {
                const frame =
                  document.getElementById(
                    "website-analyzer-frame"
                  ) as HTMLIFrameElement | null;

                if (frame) {
                  frame.src =
                    url.trim();
                }
              }}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Load
            </button>

            <button
              type="button"
              onClick={analyze}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Analyzer Preview
            </h2>
          </div>

          <iframe
            id="website-analyzer-frame"
            src={url || undefined}
            title="Horizon Jobs Analyzer"
            className="h-[600px] w-full bg-white"
          />
        </section>

        {analysis && (
          <>
            <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Metric
                label="Page Load"
                value={formatMs(
                  analysis.loadTime
                )}
              />

              <Metric
                label="FCP"
                value={formatMs(
                  analysis.firstContentfulPaint
                )}
              />

              <Metric
                label="Resources"
                value={`${analysis.resourceCount}`}
              />

              <Metric
                label="JavaScript"
                value={`${analysis.jsCount}`}
              />

              <Metric
                label="Transferred"
                value={formatBytes(
                  analysis.transferBytes
                )}
              />
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Panel title="Performance">
                <Row
                  label="Load"
                  value={formatMs(
                    analysis.loadTime
                  )}
                />

                <Row
                  label="DOMContentLoaded"
                  value={formatMs(
                    analysis.domContentLoaded
                  )}
                />

                <Row
                  label="First Paint"
                  value={formatMs(
                    analysis.firstPaint
                  )}
                />

                <Row
                  label="First Contentful Paint"
                  value={formatMs(
                    analysis.firstContentfulPaint
                  )}
                />
              </Panel>

              <Panel title="Resources">
                <Row
                  label="Total"
                  value={`${analysis.resourceCount}`}
                />

                <Row
                  label="JavaScript"
                  value={`${analysis.jsCount}`}
                />

                <Row
                  label="CSS"
                  value={`${analysis.cssCount}`}
                />

                <Row
                  label="Images"
                  value={`${analysis.imageCount}`}
                />

                <Row
                  label="Fonts"
                  value={`${analysis.fontCount}`}
                />

                <Row
                  label="Transferred"
                  value={formatBytes(
                    analysis.transferBytes
                  )}
                />
              </Panel>

              <Panel title="SEO Structure">
                <Row
                  label="Title"
                  value={analysis.title}
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
                  label="Links"
                  value={`${analysis.links}`}
                />

                <Row
                  label="Images"
                  value={`${analysis.images}`}
                />

                <Row
                  label="Broken Images"
                  value={`${analysis.brokenImages}`}
                />
              </Panel>

              <Panel title="Browser">
                <Row
                  label="Viewport"
                  value={
                    analysis.viewport
                  }
                />

                <Row
                  label="Connection"
                  value={
                    analysis.connection
                  }
                />

                <Row
                  label="Downlink"
                  value={
                    analysis.downlink
                  }
                />

                <Row
                  label="RTT"
                  value={
                    analysis.rtt
                  }
                />

                <Row
                  label="Memory"
                  value={
                    analysis.memory
                  }
                />

                <Row
                  label="Online"
                  value={
                    analysis.online
                      ? "Yes"
                      : "No"
                  }
                />
              </Panel>
            </section>
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

      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
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
        {value}
      </p>
    </div>
  );
}