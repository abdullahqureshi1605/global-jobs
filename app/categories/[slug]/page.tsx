import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import JobList from "@/components/jobs/JobList";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic =
  "force-dynamic";

async function resolveCategory(
  slug: string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("jobs")
      .select("category")
      .eq(
        "status",
        "published"
      )
      .not(
        "category",
        "is",
        null
      );

  if (error) {
    throw new Error(
      `Failed to resolve category: ${error.message}`
    );
  }

  const categories =
    Array.from(
      new Set(
        (data ?? [])
          .map(
            (row) =>
              row.category
          )
          .filter(
            (
              value
            ): value is string =>
              typeof value ===
                "string" &&
              value.trim() !== ""
          )
          .map(
            (value) =>
              value.trim()
          )
      )
    );

  return (
    categories.find(
      (category) =>
        slugify(
          category
        ) === slug
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const category =
    await resolveCategory(
      slug
    );

  return {
    title: category
      ? `${category} Jobs | Horizon Jobs`
      : "Category Jobs | Horizon Jobs",

    description: category
      ? `Explore published ${category} jobs on Horizon Jobs.`
      : "Explore published jobs by category.",
  };
}

export default async function CategoryPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const category =
    await resolveCategory(
      slug
    );

  if (!category) {
    notFound();
  }

  const jobs =
    await JobService.getJobsByCategory(
      category
    );

  const CategoryIcon =
    getCategoryIcon(
      category
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <CategoryIcon className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Career Category
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                {category} Jobs
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {jobs.length} published{" "}
            {jobs.length === 1
              ? "job"
              : "jobs"}{" "}
            available.
          </p>
        </header>

        <JobList
          jobs={jobs}
          hrefForJob={(job) =>
            `/categories/${slug}/jobs/${job.slug}`
          }
          emptyMessage={`No published ${category} jobs are available.`}
        />
      </div>
    </main>
  );
}