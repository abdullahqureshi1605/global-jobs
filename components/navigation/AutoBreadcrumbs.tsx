"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function pretty(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const COUNTRY_NAMES: Record<string, string> = {
  pakistan: "Pakistan",
  india: "India",
  canada: "Canada",
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  australia: "Australia",
  germany: "Germany",
  france: "France",
  netherlands: "Netherlands",
  ireland: "Ireland",
  spain: "Spain",
  italy: "Italy",
  portugal: "Portugal",
  switzerland: "Switzerland",
  austria: "Austria",
  belgium: "Belgium",
  sweden: "Sweden",
  norway: "Norway",
  denmark: "Denmark",
  finland: "Finland",
  poland: "Poland",
  bangladesh: "Bangladesh",
  nepal: "Nepal",
  china: "China",
  japan: "Japan",
  "south-korea": "South Korea",
  singapore: "Singapore",
  malaysia: "Malaysia",
  indonesia: "Indonesia",
  thailand: "Thailand",
  philippines: "Philippines",
  "saudi-arabia": "Saudi Arabia",
  "united-arab-emirates":
    "United Arab Emirates",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
  "south-africa": "South Africa",
  nigeria: "Nigeria",
  kenya: "Kenya",
  egypt: "Egypt",
  brazil: "Brazil",
  mexico: "Mexico",
  argentina: "Argentina",
  chile: "Chile",
  "new-zealand": "New Zealand",
};

export default function AutoBreadcrumbs() {
  const pathname = usePathname();

  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api")
  ) {
    return null;
  }

  const parts = pathname
    .split("/")
    .filter(Boolean);

  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  /*
   * /jobs
   * /jobs/[slug]
   */
  if (parts[0] === "jobs") {
    items.push({
      label: "Jobs",
      href: "/jobs",
    });

    if (parts.length >= 2) {
      items.push({
        label: pretty(
          parts[1]
        ),
      });
    }
  }

  /*
   * /countries
   * /countries/[country]
   * /countries/[country]/[city]
   * /countries/[country]/[city]/jobs/[jobSlug]
   */
  else if (
    parts[0] === "countries"
  ) {
    items.push({
      label: "Countries",
      href: "/countries",
    });

    if (parts.length >= 2) {
      const countrySlug =
        parts[1];

      const countryName =
        COUNTRY_NAMES[
          countrySlug
        ] ??
        pretty(
          countrySlug
        );

      const countryHref =
        `/countries/${countrySlug}`;

      items.push({
        label: countryName,
        href: countryHref,
      });

      if (parts.length >= 3) {
        const citySlug =
          parts[2];

        const cityHref =
          `/countries/${countrySlug}/${citySlug}`;

        items.push({
          label: pretty(citySlug),
          href: cityHref,
        });

        if (
          parts.length >= 5 &&
          parts[3] === "jobs"
        ) {
          items.push({
            label: pretty(
              parts[4]
            ),
          });
        }
      }
    }
  }

  /*
   * /categories
   * /categories/[category]
   * /categories/[category]/jobs/[jobSlug]
   */
  else if (
    parts[0] === "categories"
  ) {
    items.push({
      label: "Categories",
      href: "/categories",
    });

    if (parts.length >= 2) {
      const categorySlug =
        parts[1];

      items.push({
        label: pretty(
          categorySlug
        ),
        href: `/categories/${categorySlug}`,
      });

      if (
        parts.length >= 4 &&
        parts[2] === "jobs"
      ) {
        items.push({
          label: pretty(
            parts[3]
          ),
        });
      }
    }
  }

  /*
   * Other normal public pages.
   */
  else {
    let accumulated = "";

    parts.forEach(
      (part, index) => {
        accumulated += `/${part}`;

        items.push({
          label: pretty(part),
          href:
            index === parts.length - 1
              ? undefined
              : accumulated,
        });
      }
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6 lg:px-8">
        {items.map(
          (item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span className="text-slate-400">
                  /
                </span>
              )}

              {item.href ? (
                <Link
                  href={item.href}
                  className="font-medium text-indigo-600 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </div>
          )
        )}
      </div>
    </nav>
  );
}