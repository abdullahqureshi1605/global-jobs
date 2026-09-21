import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "../components/SiteChrome";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Horizon Jobs",
  description:
    "Find jobs and career opportunities with Horizon Jobs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f7fa]">
        <Providers>
          <SiteChrome>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
