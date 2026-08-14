import { Job } from "@/types/job";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export function createJobPostingSchema(
  job: Job,
  siteUrl: string
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: job.countryCode || job.country,
      },
    },
    url: `${siteUrl}/jobs/${job.country.toLowerCase().replace(/\s+/g, "-")}/${job.category.toLowerCase().replace(/\s+/g, "-")}/${job.slug}`,
  };

  if (job.closingDate) {
    schema.validThrough = job.closingDate;
  }

  if (job.workplaceType === "Remote") {
    schema.jobLocationType = "TELECOMMUTE";
  }

  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salaryMin
          ? { minValue: job.salaryMin }
          : {}),
        ...(job.salaryMax
          ? { maxValue: job.salaryMax }
          : {}),
        unitText: job.salaryPeriod.toUpperCase(),
      },
    };
  }

  return schema;
}