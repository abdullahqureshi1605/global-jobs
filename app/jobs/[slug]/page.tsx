import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JobDetailContent from "@/components/jobs/JobDetailContent";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic =
  "force-dynamic";

async function getJob(
  slug: string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load job: ${error.message}`
    );
  }

  return data;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const job =
    await getJob(slug);

  if (!job) {
    return {
      title:
        "Job Not Found | Horizon Jobs",
    };
  }

  return {
    title:
      `${job.title} at ${job.company} | Horizon Jobs`,

    description:
      job.description?.slice(
        0,
        160
      ) ||
      `${job.title} at ${job.company}.`,
  };
}

export default async function DirectJobPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const job =
    await getJob(slug);

  if (!job) {
    notFound();
  }

  return (
    <JobDetailContent
      job={job}
      context={{
        type: "direct",
      }}
    />
  );
}