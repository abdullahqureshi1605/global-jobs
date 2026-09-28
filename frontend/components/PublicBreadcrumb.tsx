"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  about: "About",
  contact: "Contact",
  jobs: "Jobs",
  categories: "Categories",
  countries: "Countries",
  recruiters: "For Recruiters",
  "career-resources": "Career Resources",
  privacy: "Privacy",
  "privacy-policy": "Privacy Policy",
  "cookie-policy": "Cookie Policy",
  terms: "Terms",
  disclaimer: "Disclaimer",
  "report-job": "Report Job",
  it: "IT & Technology",
  healthcare: "Healthcare",
  logistics: "Logistics",
  design: "Design & Creative",
  finance: "Finance & Accounting",
  trades: "Trades & Construction",
  customer: "Customer Service",
  retail: "Retail",
  education: "Education",
  marketing: "Marketing & Sales",
  legal: "Legal",
  hospitality: "Hospitality & Catering",
};

const countryNames: Record<string, string> = {
  us: "United States",
  gb: "United Kingdom",
  ca: "Canada",
  au: "Australia",
  de: "Germany",
  fr: "France",
  it: "Italy",
  es: "Spain",
  nl: "Netherlands",
  ie: "Ireland",
  nz: "New Zealand",
  sg: "Singapore",
  ae: "United Arab Emirates",
  sa: "Saudi Arabia",
  pk: "Pakistan",
  in: "India",
};

function humanize(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function labelFor(segment: string) {
  const key = segment.toLowerCase();

  if (labels[key]) return labels[key];
  if (countryNames[key]) return countryNames[key];

  return humanize(segment);
}

function buildItems(parts: string[]) {
  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (parts[0] === "jobs") {
    items.push({ label: "Jobs", href: "/jobs" });
    items.push({ label: "Job" });
    return items;
  }

  if (parts[0] === "categories") {
    items.push({ label: "Categories", href: "/categories" });

    if (parts[1]) {
      items.push({
        label: labelFor(parts[1]),
        href: `/categories/${parts[1]}`,
      });
    }

    if (parts[2] === "jobs") {
      items.push({ label: "Job" });
    }

    return items;
  }

  if (parts[0] === "countries") {
    items.push({ label: "Countries", href: "/countries" });

    if (parts[1]) {
      items.push({
        label: labelFor(parts[1]),
        href: `/countries/${parts[1]}`,
      });
    }

    if (parts[2] === "jobs") {
      items.push({ label: "Job" });
      return items;
    }

    if (parts[2]) {
      items.push({
        label: labelFor(parts[2]),
        href: `/countries/${parts[1]}/${parts[2]}`,
      });
    }

    if (parts[3] === "jobs") {
      items.push({ label: "Job" });
    }

    return items;
  }

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;

    items.push({
      label: labelFor(part),
      ...(isLast
        ? {}
        : { href: "/" + parts.slice(0, index + 1).join("/") }),
    });
  });

  return items;
}

export default function PublicBreadcrumb() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") return null;

  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return null;

  const items = buildItems(parts);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `https://horizonjobs.online${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <nav
      aria-label="Breadcrumb"
      className="border-b border-slate-100 bg-white"
    >
      <div className="mx-auto flex h-8 max-w-[1500px] items-center px-5 sm:px-7 lg:px-10">
        <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] font-medium text-slate-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {index > 0 && (
                  <span className="shrink-0 text-slate-300">/</span>
                )}

                {isLast || !item.href ? (
                  <span className="truncate text-[#45617F]">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="truncate transition-colors hover:text-[#2563eb]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      </nav>
    </>
  );
}

