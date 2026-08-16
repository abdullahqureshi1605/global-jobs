import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JobDetailContent from "@/components/jobs/JobDetailContent";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

interface Props {
  params: Promise<{
    slug: string;
    jobSlug: string;
  }>;
}

async function findCategoryJob(
  categorySlug: string,
  jobSlug: string
) {
  const jobs =
    await JobService.getAllJobs();

  return (
    jobs.find(
      (job) =>
        job.status === "published" &&
        job.slug === jobSlug &&
        slugify(job.category) ===
          categorySlug
    ) ?? null
  );
}

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    slug,
    jobSlug,
  } = await params;

  const job =
    await findCategoryJob(
      slug,
      jobSlug
    );

  if (!job) {
    return {
      title:
        "Job Not Found | Horizon Jobs",
    };
  }

  return {
    title:
      `${job.title} | ${job.category} Jobs | Horizon Jobs`,

    description:
      job.description?.slice(
        0,
        160
      ) ||
      `${job.title} at ${job.company}.`,
  };
}

export default async function CategoryJobPage({
  params,
}: Props) {
  const {
    slug,
    jobSlug,
  } = await params;

  const job =
    await findCategoryJob(
      slug,
      jobSlug
    );

  if (!job) {
    notFound();
  }

  return (
    <JobDetailContent
      job={job}
      context={{
        type: "category",
        categorySlug: slug,
      }}
    />
  );
}