import type { Metadata } from "next";

import {
  Suspense,
} from "react";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AutoBreadcrumbs from "@/components/navigation/AutoBreadcrumbs";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

export const metadata: Metadata = {
  title: {
    default:
      "Horizon Jobs | Global Job Discovery",
    template:
      "%s | Horizon Jobs",
  },

  description:
    "Discover global job opportunities and practical career resources with Horizon Jobs.",

  metadataBase:
    new URL(
      process.env
        .NEXT_PUBLIC_SITE_URL ||
        "https://global-jobz.netlify.app"
    ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-white">
        <div className="flex min-h-screen flex-col">
          <Header />

          <AutoBreadcrumbs />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>

        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}