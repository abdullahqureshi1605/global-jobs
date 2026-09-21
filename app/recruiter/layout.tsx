"use client";

import { usePathname } from "next/navigation";
import RecruiterShell from "@/components/recruiter/RecruiterShell";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const publicPage =
    pathname === "/recruiter/login" ||
    pathname === "/recruiter/signup";

  if (publicPage) {
    return <>{children}</>;
  }

  return (
    <RecruiterShell>
      {children}
    </RecruiterShell>
  );
}
