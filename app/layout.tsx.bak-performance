import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "../components/SiteChrome";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://horizonjobs.online"),
  title: {
    default: "Horizon Jobs | Find Jobs Worldwide",
    template: "%s | Horizon Jobs",
  },
  description:
    "Find jobs and career opportunities worldwide with Horizon Jobs. Search jobs by title, company, category, country, and location.",
  alternates: {
    canonical: "https://horizonjobs.online/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Horizon Jobs | Find Jobs Worldwide",
    description:
      "Find jobs and career opportunities worldwide with Horizon Jobs. Search jobs by title, company, category, country, and location.",
    url: "https://horizonjobs.online/",
    siteName: "Horizon Jobs",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Horizon Jobs | Find Jobs Worldwide",
    description:
      "Find jobs and career opportunities worldwide with Horizon Jobs. Search jobs by title, company, category, country, and location.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Horizon Jobs",
  url: "https://horizonjobs.online/",
  description:
    "Horizon Jobs is a global job search platform helping candidates discover employment opportunities by title, company, category, country, and location.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f7fa]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>
          <SiteChrome>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}

