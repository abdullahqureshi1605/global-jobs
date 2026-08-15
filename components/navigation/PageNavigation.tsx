"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Breadcrumbs, {
  type BreadcrumbItem,
} from "./Breadcrumbs";

function titleize(
  value: string
) {
  return decodeURIComponent(
    value
  )
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function jobBreadcrumbs(
  segments: string[]
): BreadcrumbItem[] {
  const country =
    segments[1] || "";

  const city =
    segments[2] || "";

  const slug =
    segments[3] || "";

  return [
    {
      label: "Jobs",
      href: "/jobs",
    },

    {
      label: titleize(
        country
      ),
      href: country
        ? `/jobs/${country}`
        : "/jobs",
    },

    {
      label: titleize(
        city
      ),
      /*
       * There is no city-only route,
       * so this MUST NOT be clickable.
       */
      href: undefined,
    },

    {
      label: titleize(
        slug
      ),
      href: undefined,
    },
  ];
}

function categoryBreadcrumbs(
  segments: string[]
): BreadcrumbItem[] {
  const slug =
    segments[1] || "";

  return [
    {
      label: "Categories",
      href: "/categories",
    },

    {
      label: titleize(
        slug
      ),
      href: undefined,
    },
  ];
}

function countryBreadcrumbs(
  segments: string[]
): BreadcrumbItem[] {
  const country =
    segments[1] || "";

  return [
    {
      label: "Jobs",
      href: "/jobs",
    },

    {
      label: titleize(
        country
      ),
      href: undefined,
    },
  ];
}

function careerResourceBreadcrumbs(
  segments: string[]
): BreadcrumbItem[] {
  const slug =
    segments[1] || "";

  return [
    {
      label:
        "Career Resources",
      href:
        "/career-resources",
    },

    {
      label: titleize(
        slug
      ),
      href: undefined,
    },
  ];
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

  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  let items:
    BreadcrumbItem[] = [];

  if (
    segments[0] ===
      "jobs" &&
    segments.length === 4
  ) {
    items =
      jobBreadcrumbs(
        segments
      );
  } else if (
    segments[0] ===
      "jobs" &&
    segments.length === 2
  ) {
    items =
      countryBreadcrumbs(
        segments
      );
  } else if (
    segments[0] ===
      "categories" &&
    segments.length === 2
  ) {
    items =
      categoryBreadcrumbs(
        segments
      );
  } else if (
    segments[0] ===
      "career-resources" &&
    segments.length === 2
  ) {
    items =
      careerResourceBreadcrumbs(
        segments
      );
  } else if (
    segments[0] ===
    "countries"
  ) {
    items = [
      {
        label:
          "Countries",
        href:
          segments.length >
          1
            ? "/countries"
            : undefined,
      },
    ];

    if (
      segments.length >
      1
    ) {
      items.push({
        label:
          titleize(
            segments[1]
          ),
        href:
          undefined,
      });
    }
  } else if (
    segments[0] ===
    "categories"
  ) {
    items = [
      {
        label:
          "Categories",
        href:
          segments.length >
          1
            ? "/categories"
            : undefined,
      },
    ];

    if (
      segments.length >
      1
    ) {
      items.push({
        label:
          titleize(
            segments[1]
          ),
        href:
          undefined,
      });
    }
  } else {
    items =
      segments.map(
        (
          segment,
          index
        ) => ({
          label:
            titleize(
              segment
            ),
          href:
            index ===
            segments.length -
              1
              ? undefined
              : "/" +
                segments
                  .slice(
                    0,
                    index + 1
                  )
                  .join("/"),
        })
      );
  }

  return (
    <Breadcrumbs
      items={
        items
      }
    />
  );
}