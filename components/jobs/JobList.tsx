"use client";

import { useRouter } from "next/navigation";

import JobCard from "@/components/jobs/JobCard";
import { Job } from "@/types/job";
import { slugify } from "@/lib/utils/slug";

interface JobListProps {
  jobs: Job[];
}

function getJobUrl(job: Job) {
  const country =
    slugify(job.country);

  const category =
    slugify(job.category);

  const slug =
    job.slug ||
    slugify(
      `${job.title}-${job.company}`
    );

  return (
    `/jobs/${country}/` +
    `${category}/` +
    slug
  );
}

export default function JobList({
  jobs,
}: JobListProps) {
  const router = useRouter();

  function handleSelectJob(
    job: Job
  ) {
    router.push(
      getJobUrl(job)
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Jobs Found
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          There are no published jobs available right now.
        </p>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {jobs.map(
        (job) => (
          <JobCard
            key={job.id}
            job={job}
            onSelect={
              handleSelectJob
            }
          />
        )
      )}

    </div>
  );
}