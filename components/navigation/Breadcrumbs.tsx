"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  items = [],
  className = "",
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        {items.map((item, index) => {
          const isLast =
            index === items.length - 1;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex min-w-0 shrink-0 items-center"
            >
              <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-slate-400" />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="max-w-[220px] truncate text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`max-w-[260px] truncate text-sm ${
                    isLast
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "font-medium text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}