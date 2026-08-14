import {
  BookmarkCheck,
} from "lucide-react";

import { JobService } from "@/services/jobService";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import SavedJobs from "@/components/jobs/SavedJobs";

export const metadata = {
  title: "Saved Jobs | Horizon Jobs",
  description:
    "View the jobs you have saved on your device.",
};

export default async function SavedJobsPage() {
  const jobs =
    await JobService.getPublishedJobs();

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4 mb-8">

          <BackButton label="Back" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Saved Jobs",
              },
            ]}
          />

        </div>

        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-8">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <BookmarkCheck className="w-6 h-6" />
            </div>

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Your Shortlist
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">
                Saved Jobs
              </h1>

            </div>

          </div>

          <p className="text-sm text-slate-300 mt-5 max-w-2xl">
            Keep interesting opportunities in one place so you can
            return to them later.
          </p>

        </header>

        <SavedJobs jobs={jobs} />

      </div>

    </main>
  );
}