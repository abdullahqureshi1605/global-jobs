import type { MetadataRoute } from "next";

import {
  JobService,
} from "@/services/jobService";

import {
  ResourceService,
} from "@/services/resourceService";

import {
  slugify,
} from "@/lib/utils/slug";

import {
  getSiteUrl,
} from "@/lib/seo/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [
    jobs,
    resources,
  ] = await Promise.all([
    JobService.getPublishedJobs(),
    ResourceService.getPublishedResources(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${siteUrl}/jobs`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/countries`,
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${siteUrl}/categories`,
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url:
        `${siteUrl}/career-resources`,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url:
        `${siteUrl}/report-job`,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },

    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
     {
    url: `${siteUrl}/cookie-policy`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
      url:
        `${siteUrl}/disclaimer`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const countryUrls =
    Array.from(
      new Set(
        jobs.map(
          (job) =>
            `${siteUrl}/jobs/${slugify(
              job.country
            )}`
        )
      )
    ).map((url) => ({
      url,
      changeFrequency:
        "daily" as const,
      priority: 0.7,
    }));

  const categoryUrls =
    Array.from(
      new Set(
        jobs.map(
          (job) =>
            `${siteUrl}/categories/${slugify(
              job.category
            )}`
        )
      )
    ).map((url) => ({
      url,
      changeFrequency:
        "daily" as const,
      priority: 0.7,
    }));

  const jobUrls =
    jobs.map((job) => {
      const jobSlug =
        job.slug ||
        slugify(
          `${job.title}-${job.company}`
        );

      return {
        url:
          `${siteUrl}/jobs/` +
          `${slugify(job.country)}/` +
          `${slugify(job.category)}/` +
          jobSlug,

        changeFrequency:
          "daily" as const,

        priority: 0.9,
      };
    });

  const resourceUrls =
    resources.map((resource) => ({
      url:
        `${siteUrl}/career-resources/` +
        resource.slug,

      lastModified:
        resource.updatedDate ||
        resource.publishedDate,

      changeFrequency:
        "monthly" as const,

      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...countryUrls,
    ...categoryUrls,
    ...jobUrls,
    ...resourceUrls,
  ];
}