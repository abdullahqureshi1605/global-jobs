import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/supabase-test/",
        ],
      },
    ],

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}