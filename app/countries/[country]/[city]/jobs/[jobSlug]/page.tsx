import JobDetail from "@/app/jobs/[slug]/page";

export default async function CountryCityJob({
  params,
}: {
  params: Promise<{ country: string; city: string; jobSlug: string }>;
}) {
  const { jobSlug } = await params;
  return <JobDetail params={Promise.resolve({ slug: jobSlug })} />;
}
