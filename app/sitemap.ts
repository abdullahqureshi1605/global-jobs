import type { MetadataRoute } from "next";
import { getPublishedJobs } from "@/lib/jobs";

const SITE_URL = "https://horizonjobs.online";

const categories = [
  "it",
  "healthcare",
  "logistics",
  "design",
  "finance",
  "trades",
  "customer",
  "retail",
  "education",
  "marketing",
  "legal",
  "hospitality",
];

function slugify(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/countries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/career-resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/categories/${category}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let jobs: Awaited<ReturnType<typeof getPublishedJobs>> = [];

  try {
    jobs = await getPublishedJobs("", "", 5000, "");
  } catch {
    jobs = [];
  }

  const jobUrls: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  for (const job of jobs) {
    if (!job.slug) continue;

    const lastModified = job.posted_at
      ? new Date(job.posted_at)
      : new Date(job.created_at);

    const safeDate = Number.isNaN(lastModified.getTime())
      ? now
      : lastModified;

    const directUrl = `${SITE_URL}/jobs/${job.slug}`;

    if (!seen.has(directUrl)) {
      seen.add(directUrl);

      jobUrls.push({
        url: directUrl,
        lastModified: safeDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const category = Array.isArray(job.categories)
      ? job.categories[0]
      : job.categories;

    const categorySlug = category?.slug || "";

    if (categorySlug && categories.includes(categorySlug)) {
      const categoryJobUrl =
        `${SITE_URL}/categories/${categorySlug}/jobs/${job.slug}`;

      if (!seen.has(categoryJobUrl)) {
        seen.add(categoryJobUrl);

        jobUrls.push({
          url: categoryJobUrl,
          lastModified: safeDate,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }

    const country = Array.isArray(job.countries)
      ? job.countries[0]
      : job.countries;

    const countryCode = String(country?.code || "").toLowerCase();

    if (countryCode) {
      const countryJobUrl =
        `${SITE_URL}/countries/${countryCode}/jobs/${job.slug}`;

      if (!seen.has(countryJobUrl)) {
        seen.add(countryJobUrl);

        jobUrls.push({
          url: countryJobUrl,
          lastModified: safeDate,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      if (job.city) {
        const citySlug = slugify(job.city);

        if (citySlug) {
          const cityJobUrl =
            `${SITE_URL}/countries/${countryCode}/${citySlug}/jobs/${job.slug}`;

          if (!seen.has(cityJobUrl)) {
            seen.add(cityJobUrl);

            jobUrls.push({
              url: cityJobUrl,
              lastModified: safeDate,
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        }
      }
    }
  }

  return [
    ...staticUrls,
    ...categoryUrls,
    ...jobUrls,
  ];
}

