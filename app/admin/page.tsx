import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminAccess } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

type Metrics = {
  totalRaw: number;
  pending: number;
  processed: number;
  needsReview: number;
  approved: number;
  readyToPublish: number;
  published: number;
  draft: number;
  unpublished: number;
};

async function getMetrics(): Promise<Metrics> {
  const supabase = supabaseAdmin;

  const [
    rawResult,
    contentResult,
  ] = await Promise.all([
    supabase
      .from("adzuna_raw_jobs")
      .select("id,processing_status"),

    supabase
      .from("job_content")
      .select(
        "id,quality_status,publication_status,manual_review_required,ad_eligibility_status"
      ),
  ]);

  if (rawResult.error) {
    throw new Error(
      `Raw jobs query failed: ${rawResult.error.message}`
    );
  }

  if (contentResult.error) {
    throw new Error(
      `Job content query failed: ${contentResult.error.message}`
    );
  }

  const raw = rawResult.data ?? [];
  const content = contentResult.data ?? [];

  const pending = raw.filter(
    (row) => row.processing_status === "pending"
  ).length;

  const processed = raw.filter(
    (row) => row.processing_status === "processed"
  ).length;

  const needsReview = content.filter(
    (row) => row.quality_status === "needs_review"
  ).length;

  const approved = content.filter(
    (row) => row.quality_status === "approved"
  ).length;

  const published = content.filter(
    (row) => row.publication_status === "published"
  ).length;

  const draft = content.filter(
    (row) => row.publication_status === "draft"
  ).length;

  const unpublished = content.filter(
    (row) => row.publication_status === "unpublished"
  ).length;

  const readyToPublish = content.filter(
    (row) =>
      row.quality_status === "approved" &&
      row.publication_status === "draft" &&
      row.ad_eligibility_status === "eligible" &&
      row.manual_review_required === false
  ).length;

  return {
    totalRaw: raw.length,
    pending,
    processed,
    needsReview,
    approved,
    readyToPublish,
    published,
    draft,
    unpublished,
  };
}

export default async function AdminDashboard() {
  await requireAdminAccess();

  let metrics: Metrics | null = null;
  let error = "";

  try {
    metrics = await getMetrics();
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Unable to load live dashboard data.";
  }

  const cards = [
    {
      title: "Ready for AI",
      value: metrics?.pending ?? "—",
      href: "/admin/processing",
      description: "Real jobs waiting for AI processing",
    },
    {
      title: "Needs Review",
      value: metrics?.needsReview ?? "—",
      href: "/admin/jobs?status=needs_review",
      description: "Jobs requiring editorial attention",
    },
    {
      title: "Ready to Publish",
      value: metrics?.readyToPublish ?? "—",
      href: "/admin/jobs?status=ready",
      description: "Human-approved publication candidates",
    },
    {
      title: "Published",
      value: metrics?.published ?? "—",
      href: "/admin/jobs/published",
      description: "Jobs currently public",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold tracking-[0.2em] text-cyan-400">
          CONTROL CENTER
        </div>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          Live operational view of the Horizon Jobs ingestion,
          processing, quality and publication pipeline.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
          <div className="font-black">Dashboard database error</div>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
          >
            <div className="text-sm font-medium text-slate-400">
              {card.title}
            </div>

            <div className="mt-4 text-4xl font-black text-white">
              {card.value}
            </div>

            <div className="mt-3 text-xs leading-5 text-slate-500">
              {card.description}
            </div>

            <div className="mt-5 text-sm font-bold text-cyan-400">
              Open queue →
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            INGESTION & PROCESSING
          </div>

          <h2 className="mt-3 text-2xl font-black text-white">
            Pipeline status
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Metric label="Raw jobs" value={metrics?.totalRaw} />
            <Metric label="Pending" value={metrics?.pending} />
            <Metric label="Processed" value={metrics?.processed} />
            <Metric label="Needs review" value={metrics?.needsReview} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            QUALITY & PUBLICATION
          </div>

          <h2 className="mt-3 text-2xl font-black text-white">
            Editorial lifecycle
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Metric label="Approved" value={metrics?.approved} />
            <Metric label="Ready to publish" value={metrics?.readyToPublish} />
            <Metric label="Published" value={metrics?.published} />
            <Metric label="Draft" value={metrics?.draft} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-7">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
          CONTENT MANAGEMENT
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Career Resources
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create, edit, review and publish real career articles.
            </p>
          </div>

          <Link
            href="/admin/resources"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
          >
            Open Article Engine →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black text-white">
        {value ?? "—"}
      </div>
    </div>
  );
}