import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ||
  "Horizon Jobs";

export function absoluteUrl(path: string = "/") {
  return new URL(path, siteUrl).toString();
}

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export function createMetadata({
  title,
  description,
  path = "/",
  image = "/og-image.png",
}: SeoOptions): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createJobMetadata({
  title,
  company,
  country,
  city,
  description,
  path,
}: {
  title: string;
  company: string;
  country: string;
  city: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} at ${company} | ${country} | ${siteName}`;

  const fullDescription =
    `${description.slice(0, 145)} ` +
    `View job details, requirements, location, salary and application information.`;

  return createMetadata({
    title: fullTitle,
    description: fullDescription,
    path,
  });
}

export function createCountryMetadata(
  countryName: string,
  countrySlug: string
): Metadata {
  return createMetadata({
    title: `${countryName} Jobs | ${siteName}`,
    description:
      `Explore job opportunities in ${countryName}. ` +
      `Find jobs by category, location, workplace type and experience level.`,
    path: `/jobs/${countrySlug}`,
  });
}

export function createCategoryMetadata(
  countryName: string,
  countrySlug: string,
  categoryName: string,
  categorySlug: string
): Metadata {
  return createMetadata({
    title:
      `${categoryName} Jobs in ${countryName} | ${siteName}`,
    description:
      `Browse ${categoryName} jobs in ${countryName}. ` +
      `Explore available positions, locations, workplace types and employment opportunities.`,
    path: `/jobs/${countrySlug}/${categorySlug}`,
  });
}