import JobDetail from "@/app/jobs/[slug]/page";

export default async function CountryJob({
  params,
}: {
  params: Promise<{ country: string; jobSlug: string }>;
}) {
  const { jobSlug } = await params;
  return <JobDetail params={Promise.resolve({ slug: jobSlug })} />;
}
