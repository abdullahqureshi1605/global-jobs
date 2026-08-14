export function organizationSchema(
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "Horizon Jobs",

    url: baseUrl,

    description:
      "Global job discovery platform providing employment opportunities and career resources.",

    logo: `${baseUrl}/icon.png`,
  };
}

export function websiteSchema(
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",

    name: "Horizon Jobs",

    url: baseUrl,
  };
}

export function breadcrumbSchema(
  items: Array<{
    name: string;
    url?: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: items.map(
      (item, index) => {
        const result: Record<
          string,
          unknown
        > = {
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
        };

        if (item.url) {
          result.item = item.url;
        }

        return result;
      }
    ),
  };
}

export function articleSchema({
  title,
  description,
  url,
  author,
  publishedDate,
  updatedDate,
}: {
  title: string;
  description: string;
  url: string;
  author: string;
  publishedDate: string;
  updatedDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: title,

    description,

    url,

    author: {
      "@type": "Organization",
      name: author,
    },

    datePublished: publishedDate,

    dateModified:
      updatedDate || publishedDate,

    publisher: {
      "@type": "Organization",
      name: "Horizon Jobs",
    },
  };
}