import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedCareerResources, type CareerResource } from "@/lib/career-resources";

export const metadata: Metadata = {
  title: "Career Resources | Horizon Jobs",
  description:
    "Practical career advice, job search guidance, interview tips, workplace skills, and employment resources from Horizon Jobs.",
};

function formatDate(value: string | null) {
  if (!value) return "Recently published";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getExcerpt(body: string) {
  const text = String(body || "")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/[-*]\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 180 ? `${text.slice(0, 180).trim()}?` : text;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default async function CareerResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const searchTerm = typeof params.q === "string" ? params.q.trim() : "";
  const selectedCategory =
    typeof params.category === "string" ? params.category.trim() : "";

  const requestedPage =
    typeof params.page === "string"
      ? Number.parseInt(params.page, 10) || 1
      : 1;

  let resources: CareerResource[] = [];

  try {
    resources = await getPublishedCareerResources();
  } catch {
    resources = [];
  }

  const categories = Array.from(
    new Set(
      resources
        .map((resource) => resource.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  );

  const filteredResources = resources.filter((resource) => {
    const searchableText = normalize(
      [
        resource.title,
        resource.category || "",
        resource.body,
      ].join(" "),
    );

    const matchesSearch =
      !searchTerm || searchableText.includes(normalize(searchTerm));

    const matchesCategory =
      !selectedCategory ||
      normalize(resource.category || "") === normalize(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const pageSize = 9;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredResources.length / pageSize),
  );

  const currentPage = Math.min(
    Math.max(1, requestedPage),
    totalPages,
  );

  const startIndex = (currentPage - 1) * pageSize;

  const pagedResources = filteredResources.slice(
    startIndex,
    startIndex + pageSize,
  );

  const pageHref = (pageNumber: number) => {
    const query = new URLSearchParams();

    if (searchTerm) query.set("q", searchTerm);
    if (selectedCategory) query.set("category", selectedCategory);
    if (pageNumber > 1) query.set("page", String(pageNumber));

    const queryString = query.toString();

    return queryString
      ? `/career-resources?${queryString}`
      : "/career-resources";
  };

  const categoryHref = (category: string) => {
    const query = new URLSearchParams();

    if (searchTerm) query.set("q", searchTerm);
    if (category) query.set("category", category);

    const queryString = query.toString();

    return queryString
      ? `/career-resources?${queryString}`
      : "/career-resources";
  };

  return (
    <main className="horizon-page bg-white">
      <section className="border-b border-[#E5EAF1] bg-[#F4F7FB]">
        <div className="horizon-container py-12 sm:py-16">
          <p className="horizon-eyebrow">HORIZON JOBS</p>

          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-[#071a35] sm:text-4xl">
            Career Resources
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#52657D] sm:text-base">
            Practical guidance to help you search for opportunities, prepare
            stronger applications, improve your interview skills, and build
            your career with confidence.
          </p>

          <form
            method="get"
            className="mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search articles..."
              aria-label="Search career resources"
              className="min-h-12 flex-1 rounded-xl border border-[#D5DDE8] bg-white px-4 text-sm text-[#071a35] outline-none transition placeholder:text-[#7B8CA3] focus:border-[#071a35] focus:ring-2 focus:ring-[#071a35]/10"
            />

            {selectedCategory ? (
              <input
                type="hidden"
                name="category"
                value={selectedCategory}
              />
            ) : null}

            <button
              type="submit"
              className="min-h-12 rounded-xl bg-[#071a35] px-6 text-sm font-bold text-white transition hover:bg-[#102b4a]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="horizon-container horizon-section">
        <div className="mb-7">
          <p className="horizon-eyebrow">CAREER GUIDANCE</p>

          <h2 className="mt-2 text-2xl font-black text-[#071a35] sm:text-3xl">
            Latest Articles
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#52657D]">
            Practical career advice, job-search guidance, interview tips, and
            professional resources published by Horizon Jobs.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="mb-9 flex flex-wrap gap-2">
            <Link
              href={
                searchTerm
                  ? `/career-resources?q=${encodeURIComponent(searchTerm)}`
                  : "/career-resources"
              }
              className={
                !selectedCategory
                  ? "rounded-full bg-[#071a35] px-4 py-2 text-xs font-bold !text-white shadow-sm"
                  : "rounded-full border border-[#D5DDE8] bg-white px-4 py-2 text-xs font-semibold text-[#45617F] transition hover:border-[#071a35] hover:text-[#071a35]"
              }
            >
              All Topics
            </Link>

            {categories.slice(0, 6).map((category) => (
              <Link
                key={category}
                href={categoryHref(category)}
                className={
                  normalize(selectedCategory) === normalize(category)
                    ? "rounded-full bg-[#071a35] px-4 py-2 text-xs font-bold !text-white shadow-sm"
                    : "rounded-full border border-[#D5DDE8] bg-white px-4 py-2 text-xs font-semibold text-[#45617F] transition hover:border-[#071a35] hover:text-[#071a35]"
                }
              >
                {category}
              </Link>
            ))}
          </div>
        ) : null}

        {resources.length === 0 ? (
          <div className="horizon-card max-w-3xl p-8 sm:p-10">
            <h3 className="text-lg font-black text-[#071a35]">
              Career resources are coming soon
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#52657D]">
              We are preparing practical career guidance and job-search
              resources. Please check back soon for new articles.
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-xl bg-[#071a35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102b4a]"
            >
              Browse Jobs
            </Link>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="horizon-card p-8 text-center sm:p-10">
            <h3 className="text-lg font-black text-[#071a35]">
              No matching articles found
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#52657D]">
              Try a different search term or choose another topic.
            </p>

            <Link
              href="/career-resources"
              className="mt-6 inline-flex rounded-xl bg-[#071a35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102b4a]"
            >
              View All Articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pagedResources.map((resource) => (
                <article
                  key={resource.id}
                  className="horizon-card flex h-full min-h-[330px] flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="border-b border-[#E5EAF1] bg-[#F4F7FB] px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-[11px] font-bold text-[#9A6700]">
                        {resource.category || "Career Advice"}
                      </span>

                      <time
                        dateTime={
                          resource.published_at || resource.created_at
                        }
                        className="text-[11px] font-semibold text-[#7B8CA3]"
                      >
                        {formatDate(resource.published_at)}
                      </time>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-black leading-7 text-[#071a35]">
                      {resource.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-[#52657D]">
                      {getExcerpt(resource.body)}
                    </p>

                    <div className="mt-6 border-t border-[#E5EAF1] pt-4">
                      <Link
                        href={`/career-resources/${encodeURIComponent(resource.slug)}`}
                        className="inline-flex text-sm font-bold text-[#071a35] transition hover:text-[#D99A2B]"
                      >
                        Read Article →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
                aria-label="Career resources pagination"
              >
                {currentPage > 1 ? (
                  <Link
                    href={pageHref(currentPage - 1)}
                    className="rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#071a35] transition hover:border-[#071a35] hover:bg-[#F4F7FB]"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] px-3 py-2 text-[12px] font-bold text-[#A7B3C2]">
                    Previous
                  </span>
                )}

                {Array.from(
                  {
                    length: Math.min(5, totalPages),
                  },
                  (_, index) =>
                    Math.max(
                      1,
                      Math.min(currentPage - 2, totalPages - 4),
                    ) + index,
                ).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={pageHref(pageNumber)}
                    aria-current={
                      pageNumber === currentPage ? "page" : undefined
                    }
                    className={
                      pageNumber === currentPage
                        ? "rounded-lg bg-[#071a35] px-3 py-2 text-[12px] font-bold !text-white shadow-sm"
                        : "rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#071a35] transition hover:border-[#071a35] hover:bg-[#F4F7FB]"
                    }
                  >
                    {pageNumber}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link
                    href={pageHref(currentPage + 1)}
                    className="rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#071a35] transition hover:border-[#071a35] hover:bg-[#F4F7FB]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] px-3 py-2 text-[12px] font-bold text-[#A7B3C2]">
                    Next
                  </span>
                )}
              </nav>
          </>
        )}
      </section>
    </main>
  )
}
