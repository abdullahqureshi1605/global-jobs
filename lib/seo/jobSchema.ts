import { Job } from "@/types/job";

function employmentTypeValue(
  value: string
) {
  const normalized = value
    .toLowerCase()
    .trim();

  const map: Record<string, string> = {
    "full-time": "FULL_TIME",
    fulltime: "FULL_TIME",

    "part-time": "PART_TIME",
    parttime: "PART_TIME",

    contract: "CONTRACTOR",

    temporary: "TEMPORARY",

    internship: "INTERN",

    volunteer: "VOLUNTEER",

    "per-diem": "PER_DIEM",
  };

  return (
    map[normalized] ||
    normalized
      .toUpperCase()
      .replace(/[^A-Z_]/g, "_")
  );
}

function textToHtml(
  text: string
) {
  return text
    .split(/\n+/)
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${paragraph
          .trim()
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`
    )
    .join("");
}

export function generateJobPostingSchema(
  job: Job
) {
  const schema: Record<
    string,
    unknown
  > = {
    "@context": "https://schema.org",
    "@type": "JobPosting",

    title: job.title,

    description: textToHtml(
      job.description
    ),

    datePosted: job.datePosted,

    employmentType:
      employmentTypeValue(
        job.employmentType
      ),

    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },

    identifier: {
      "@type": "PropertyValue",
      name: job.company,
      value: job.id,
    },

    jobLocation: {
      "@type": "Place",

      address: {
        "@type": "PostalAddress",

        addressLocality: job.city,

        addressCountry:
          job.countryCode.toUpperCase(),
      },
    },

    directApply: true,
  };

  if (job.closingDate) {
    schema.validThrough =
      job.closingDate;
  }

  if (
    job.workplaceType
      .toLowerCase()
      .trim() === "remote"
  ) {
    schema.jobLocationType =
      "TELECOMMUTE";

    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: job.country,
    };
  }

  if (
    job.salaryMin ||
    job.salaryMax
  ) {
    const value: Record<
      string,
      unknown
    > = {
      "@type": "QuantitativeValue",

      unitText:
        job.salaryPeriod.toUpperCase(),
    };

    if (job.salaryMin) {
      value.minValue =
        job.salaryMin;
    }

    if (job.salaryMax) {
      value.maxValue =
        job.salaryMax;
    }

    schema.baseSalary = {
      "@type": "MonetaryAmount",

      currency:
        job.salaryCurrency,

      value,
    };
  }

  return schema;
}