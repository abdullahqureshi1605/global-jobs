"use client";

import { useEffect, useState } from "react";

export default function AdSenseAdminPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [review, setReview] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [reviewResponse, seoResponse] = await Promise.all([
        fetch(`${backend}/api/review/stats`, {
          cache: "no-store",
        }),
        fetch(`${backend}/api/admin-ops/seo/audit`, {
          cache: "no-store",
        }),
      ]);

      const reviewData = await reviewResponse.json();
      const seoData = await seoResponse.json();

      if (!reviewResponse.ok || reviewData.status !== "ok") {
        throw new Error(
          reviewData.detail || "Review audit failed."
        );
      }

      if (!seoResponse.ok || seoData.status !== "ok") {
        throw new Error(
          seoData.detail || "SEO audit failed."
        );
      }

      setReview(reviewData.stats);
      setSeo(seoData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load readiness data."
      );
    }
  }

  useEffect(() => {
    load();
  }, [backend]);

  const published =
    review?.published || 0;

  const approved =
    review?.approved || 0;

  const eligible =
    review?.ad_eligible || 0;

  const ready =
    review?.ready_to_publish || 0;

  const reviewRequired =
    review?.manual_review_required || 0;

  const internalReadiness =
    published > 0 &&
    eligible >= published &&
    ready === 0 &&
    (review?.needs_review || 0) === 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          MONETIZATION
        </div>

        <h1 className="mt-2 text-3xl font-black">
          AdSense Readiness
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Internal publication-quality controls built around current
          Google publisher guidance. This is not a Google approval prediction.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div
        className={`rounded-2xl border p-6 ${
          internalReadiness
            ? "border-emerald-400/20 bg-emerald-400/10"
            : "border-amber-400/20 bg-amber-400/10"
        }`}
      >
        <div className="text-xs font-bold uppercase tracking-wider">
          Internal readiness
        </div>

        <div className="mt-2 text-3xl font-black">
          {internalReadiness
            ? "PASS"
            : "NEEDS ATTENTION"}
        </div>

        <p className="mt-3 max-w-3xl text-sm opacity-80">
          Every published page should contain useful publisher content,
          meet the internal 90/100 quality gates, and pass human review.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Published" value={published} />
        <Metric label="Approved" value={approved} />
        <Metric label="Ad Eligible" value={eligible} />
        <Metric label="Needs Review" value={review?.needs_review || 0} />
        <Metric label="Human Review Required" value={reviewRequired} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">
          Publication Gate
        </h2>

        <div className="mt-5 space-y-3">
          <Gate
            label="Published content exists"
            pass={published > 0}
          />
          <Gate
            label="No pending quality review"
            pass={(review?.needs_review || 0) === 0}
          />
          <Gate
            label="All published pages internally eligible"
            pass={eligible >= published}
          />
          <Gate
            label="No unreviewed jobs ready for release"
            pass={ready === 0}
          />
          <Gate
            label="SEO audit has no published-page issues"
            pass={(seo?.issues?.length || 0) === 0}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">
          Important Policy Principle
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Horizon Jobs keeps the original source record privately for
          provenance and auditing, while the public job content is rewritten
          into substantially original, useful employment information.
          Automatically generated content is not allowed to bypass human
          review in this workflow.
        </p>
      </section>
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
      <div className="text-sm text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">
        {value}
      </div>
    </div>
  );
}

function Gate({
  label,
  pass,
}: {
  label: string;
  pass: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-4">
      <span className="text-sm text-slate-300">
        {label}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          pass
            ? "bg-emerald-400/10 text-emerald-300"
            : "bg-amber-400/10 text-amber-300"
        }`}
      >
        {pass ? "PASS" : "CHECK"}
      </span>
    </div>
  );
}
