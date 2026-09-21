"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const workspace =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/recruiter" ||
    pathname.startsWith("/recruiter/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (workspace) {
    return (
      <main className="min-h-screen bg-[#f5f7fa]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
