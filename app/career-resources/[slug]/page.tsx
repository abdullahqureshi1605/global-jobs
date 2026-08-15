import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase/admin";
import ResourceContent from "@/components/resources/ResourceContent";
import BackButton from "@/components/navigation/BackButton";

export const revalidate = 60;

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getResource(
  slug: string
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from("resources")
    .select(
      `
      id,
      title,
      slug,
      category,
      description,
      content,
      author,
      author_role,
      published_date,
      updated_date,
      read_time,
      featured,
      status,
      seo_title,
      seo_description
      `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load resource: ${error.message}`
    );
  }

  return data;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const resource =
    await getResource(slug);

  if (!resource) {
    return {
      title:
        "Career Resource Not Found | Horizon Jobs",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://global-jobz.netlify.app";

  return {
    title:
      resource.seo_title ||
      `${resource.title} | Horizon Jobs`,

    description:
      resource.seo_description ||
      resource.description,

    alternates: {
      canonical: `${baseUrl}/career-resources/${resource.slug}`,
    },

    openGraph: {
      title:
        resource.seo_title ||
        resource.title,

      description:
        resource.seo_description ||
        resource.description,

      type: "article",

      publishedTime:
        resource.published_date ||
        undefined,

      modifiedTime:
        resource.updated_date ||
        undefined,

      authors: resource.author
        ? [resource.author]
        : undefined,
    },
  };
}

export default async function CareerResourcePage({
  params,
}: ResourcePageProps) {
  const { slug } =
    await params;

  const resource =
    await getResource(slug);

  if (!resource) {
    notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://global-jobz.netlify.app";

  const articleSchema = {
    "@context":
      "https://schema.org",
    "@type":
      "Article",

    headline:
      resource.title,

    description:
      resource.description,

    datePublished:
      resource.published_date,

    dateModified:
      resource.updated_date ||
      resource.published_date,

    author: {
      "@type":
        "Person",
      name:
        resource.author,
    },

    publisher: {
      "@type":
        "Organization",
      name:
        "Horizon Jobs",
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",
      "@id": `${baseUrl}/career-resources/${resource.slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton
            label="Back to Career Resources"
            fallbackHref="/career-resources"
          />
        </div>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-200 p-7 dark:border-slate-800 sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {resource.category}
              </span>

              {resource.featured && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {resource.title}
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              {resource.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span>
                By {resource.author}
                {resource.author_role
                  ? ` · ${resource.author_role}`
                  : ""}
              </span>

              <span>
                {resource.read_time}
              </span>

              <span>
                Published{" "}
                {resource.published_date}
              </span>

              {resource.updated_date && (
                <span>
                  Updated{" "}
                  {resource.updated_date}
                </span>
              )}
            </div>
          </header>

          <div className="p-7 sm:p-10">
            <ResourceContent
              content={
                resource.content
              }
            />
          </div>

          <footer className="border-t border-slate-200 bg-slate-50 p-7 dark:border-slate-800 dark:bg-slate-800/40 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Looking for your next opportunity?
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Explore current jobs from our published listings.
                </p>
              </div>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Find Jobs →
              </Link>
            </div>
          </footer>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                articleSchema
              ),
          }}
        />
      </div>
    </main>
  );
}