"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function formatSegment(
  segment: string
): string {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function AutoBreadcrumbs() {
  const pathname = usePathname();

  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return null;
  }

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (!segments.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-5"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <li>
          <Link
            href="/"
            className="text-indigo-600 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
          >
            Home
          </Link>
        </li>

        {segments.map(
          (segment, index) => {
            const href =
              "/" +
              segments
                .slice(0, index + 1)
                .join("/");

            const isLast =
              index ===
              segments.length - 1;

            return (
              <li
                key={`${segment}-${index}`}
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="text-slate-400 dark:text-slate-600"
                >
                  /
                </span>

                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    {formatSegment(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-indigo-600 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
                  >
                    {formatSegment(segment)}
                  </Link>
                )}
              </li>
            );
          }
        )}
      </ol>
    </nav>
  );
}