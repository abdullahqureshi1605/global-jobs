import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JobDetailContent from "@/components/jobs/JobDetailContent";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

interface Props {
  params: Promise<{
    country: string;
    city: string;
    jobSlug: string;
  }>;
}

const COUNTRY_NAMES: Record<
  string,
  string
> = {
  pakistan: "Pakistan",
  india: "India",
  canada: "Canada",
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  australia: "Australia",
  germany: "Germany",
  france: "France",
  netherlands: "Netherlands",
  ireland: "Ireland",
  spain: "Spain",
  italy: "Italy",
  portugal: "Portugal",
  switzerland: "Switzerland",
  austria: "Austria",
  belgium: "Belgium",
  sweden: "Sweden",
  norway: "Norway",
  denmark: "Denmark",
  finland: "Finland",
  poland: "Poland",
  bangladesh: "Bangladesh",
  nepal: "Nepal",
  china: "China",
  japan: "Japan",
  "south-korea": "South Korea",
  singapore: "Singapore",
  malaysia: "Malaysia",
  indonesia: "Indonesia",
  thailand: "Thailand",
  philippines: "Philippines",
  "saudi-arabia": "Saudi Arabia",
  "united-arab-emirates":
    "United Arab Emirates",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
  "south-africa": "South Africa",
  nigeria: "Nigeria",
  kenya: "Kenya",
  egypt: "Egypt",
  brazil: "Brazil",
  mexico: "Mexico",
  argentina: "Argentina",
  chile: "Chile",
  "new-zealand": "New Zealand",
};

export const dynamic =
  "force-dynamic";

async function findJob(
  country: string,
  city: string,
  jobSlug: string
) {
  const countryName =
    COUNTRY_NAMES[country];

  if (!countryName) {
    return null;
  }

  const jobs =
    await JobService.getJobsByCountry(
      countryName
    );

  return (
    jobs.find(
      (job) =>
        job.slug === jobSlug &&
        slugify(job.city) === city
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    country,
    city,
    jobSlug,
  } = await params;

  const job =
    await findJob(
      country,
      city,
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
      `${job.title} in ${job.city} | Horizon Jobs`,

    description:
      job.description?.slice(
        0,
        160
      ) ||
      `${job.title} at ${job.company}.`,
  };
}

export default async function CountryCityJobPage({
  params,
}: Props) {
  const {
    country,
    city,
    jobSlug,
  } = await params;

  const job =
    await findJob(
      country,
      city,
      jobSlug
    );

  if (!job) {
    notFound();
  }

  return (
    <JobDetailContent
      job={job}
      context={{
        type: "country-city",
        countrySlug: country,
        citySlug: city,
      }}
    />
  );
}