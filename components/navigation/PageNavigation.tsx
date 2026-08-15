"use client";

import { usePathname } from "next/navigation";

import Breadcrumbs, {
  type BreadcrumbItem,
} from "./Breadcrumbs";

function formatSegment(
  segment: string
): string {
  return decodeURIComponent(
    segment
  )
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function buildBreadcrumbs(
  pathname: string
): BreadcrumbItem[] {
  const segments = pathname
    .split("/")
    .filter(Boolean);

  const items: BreadcrumbItem[] = [];

  segments.forEach(
    (segment, index) => {
      const href =
        "/" +
        segments
          .slice(0, index + 1)
          .join("/");

      items.push({
        label:
          formatSegment(
            segment
          ),
        href:
          index ===
          segments.length - 1
            ? undefined
            : href,
      });
    }
  );

  return items;
}

export default function PageNavigation() {
  const pathname =
    usePathname();

  if (
    !pathname ||
    pathname === "/"
  ) {
    return null;
  }

  const items =
    buildBreadcrumbs(
      pathname
    );

  return (
    <Breadcrumbs
      items={items}
    />
  );
}