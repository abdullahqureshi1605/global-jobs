import type { NextConfig } from "next";

const isProduction =
  process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",

        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },

          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },

          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },

          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value:
                    "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },

      {
        source: "/api/:path*",

        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },

          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },

      {
        source: "/admin/:path*",

        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },

          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },

      {
        source: "/supabase-test/:path*",

        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },

          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;