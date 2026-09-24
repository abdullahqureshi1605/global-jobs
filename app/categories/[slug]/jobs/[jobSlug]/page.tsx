import JobDetail from "@/app/jobs/[slug]/page";

export default async function CategoryJob({
  params,
}: {
  params: Promise<{ slug: string; jobSlug: string }>;
}) {
  const { jobSlug } = await params;
  return <JobDetail params={Promise.resolve({ slug: jobSlug })} />;
}
