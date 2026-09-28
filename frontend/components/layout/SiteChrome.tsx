"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteChrome() {
  const pathname = usePathname();

  const workspace =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/saved" ||
    pathname.startsWith("/saved/") ||
    pathname === "/job-alerts" ||
    pathname.startsWith("/recruiter/");

  if (workspace) {
    return null;
  }

  return (
    <>
      <Header />
      <Footer />
    </>
  );
}
