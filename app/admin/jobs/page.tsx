import { Suspense } from "react";
import JobsClient from "./JobsClient";

function JobsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="text-lg font-black">Loading jobs...</div>
          <div className="mt-2 text-sm text-white/50">
            Loading the admin job review workspace.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<JobsLoading />}>
      <JobsClient />
    </Suspense>
  );
}