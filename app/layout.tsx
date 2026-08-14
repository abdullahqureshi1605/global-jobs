import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalBackButton from "@/components/layout/GlobalBackButton";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

import {
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schema";

import {
  getSiteUrl,
} from "@/lib/seo/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default:
      "Horizon Jobs | Global Job Discovery Platform",
    template:
      "%s | Horizon Jobs",
  },

  description:
    "Discover global employment opportunities, verified job listings, and practical career resources.",

  metadataBase:
    new URL(siteUrl),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organization =
    organizationSchema(siteUrl);

  const website =
    websiteSchema(siteUrl);

  return (
    <html lang="en">

      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">

        {/* Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-3 focus:rounded-xl focus:bg-white focus:text-slate-900 focus:shadow-xl"
        >
          Skip to main content
        </a>

        {/* Global structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                organization
              ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                website
              ),
          }}
        />

        {/* AdSense */}
        {process.env
          .NEXT_PUBLIC_ADSENSE_ENABLED ===
          "true" &&
          process.env
            .NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}

        <Header />

        <GlobalBackButton />

        <main
          id="main-content"
          className="min-h-[calc(100vh-80px)]"
        >
          {children}
        </main>

        <Footer />

        <WhatsAppButton />

      </body>

    </html>
  );
}