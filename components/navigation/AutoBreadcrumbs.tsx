"use client";

import { usePathname } from "next/navigation";

import PageNavigation from "./PageNavigation";

const hiddenRoutes = [
  "/admin",
  "/api",
  "/supabase-test",
];

function isHiddenRoute(
  pathname: string
) {
  return hiddenRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(
        `${route}/`
      )
  );
}

export default function AutoBreadcrumbs() {
  const pathname =
    usePathname();

  if (
    !pathname ||
    pathname === "/" ||
    isHiddenRoute(pathname)
  ) {
    return null;
  }

  return (
    <PageNavigation />
  );
}