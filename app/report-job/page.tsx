import { createMetadata } from "@/lib/seo";
import ReportJobForm from "@/components/jobs/ReportJobForm";

export const metadata = createMetadata({
  title: "Report a Job | Horizon Jobs",
  description:
    "Report an expired, incorrect, misleading, or suspicious job listing.",
  path: "/report-job",
});

export default function ReportJobPage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Job Quality
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Report a Job
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Tell us about an expired, incorrect, broken, or suspicious listing.
          </p>
        </div>

        <ReportJobForm />

      </div>
    </main>
  );
}