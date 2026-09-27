import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock3 } from "lucide-react";
import {
  getCareerResourceBySlug,
  getPublishedCareerResources,
} from "@/lib/career-resources";
import ResourceComments from "@/components/resources/ResourceComments";
import ResourceContent from "@/components/resources/ResourceContent";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Recently published";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function readTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getHeadings(body: string) {
  const seen = new Map<string, number>();
  const headings: { id: string; title: string; level: 2 | 3 }[] = [];

  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const match = line.match(/^(#{1,3})\s*(.+)$/);

    if (!match) continue;

    const level = match[1].length;

    if (level === 1) {
      continue;
    }

    const title = match[2].trim();
    const base = slugifyHeading(title) || "section";
    const count = seen.get(base) || 0;

    seen.set(base, count + 1);

    headings.push({
      id: count ? `${base}-${count + 1}` : base,
      title,
      level: level === 3 ? 3 : 2,
    });
  }

  return headings;
}

export default async function CareerResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resource = await getCareerResourceBySlug(
    decodeURIComponent(slug)
  );

  if (!resource) {
    notFound();
  }

  let related: Awaited<
    ReturnType<typeof getPublishedCareerResources>
  > = [];

  try {
    const resources = await getPublishedCareerResources();

    related = resources
      .filter((item) => item.id !== resource.id)
      .sort((a, b) => {
        const sameA =
          resource.category && a.category === resource.category ? 1 : 0;
        const sameB =
          resource.category && b.category === resource.category ? 1 : 0;

        return sameB - sameA;
      })
      .slice(0, 3);
  } catch {
    related = [];
  }

  const headings = getHeadings(resource.body);
  const minutes = readTime(resource.body);

  return (
    <main className="horizon-page bg-[#F4F7FB]">
      <div className="horizon-container py-8 sm:py-10">

        <header className="horizon-card bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071a35] text-[#e4ad2f]">
              <BookOpen size={20} />
            </div>

            <div className="min-w-0 flex-1">
              {resource.category ? (
                <p className="horizon-eyebrow">
                  {resource.category}
                </p>
              ) : null}

              <h1 className="mt-1 max-w-4xl text-[24px] font-black leading-tight text-[#071a35]">
                {resource.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold text-[#52657D]">
                <span className="font-bold text-[#071a35]">
                  Horizon Jobs
                </span>

                <span aria-hidden="true">?</span>

                <time dateTime={resource.published_at || resource.created_at}>
                  Published {formatDate(resource.published_at)}
                </time>

                <span aria-hidden="true">?</span>

                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} />
                  {minutes} min read
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {resource.category ? (
                  <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-[11px] font-bold text-[#8A5A00]">
                    {resource.category}
                  </span>
                ) : null}

                <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[11px] font-bold text-[#2563EB]">
                  Career Resource
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">

          <article className="min-w-0 rounded-xl border border-[#E5EAF1] bg-white p-6 sm:p-8">
            <ResourceContent content={resource.body} />

            <div className="mt-8 border-t border-[#E5EAF1] pt-5">
              <Link
                href="/career-resources"
                className="inline-flex items-center gap-2 text-[12px] font-bold text-[#071a35] transition hover:text-[#D99A2B]"
              >
                ? Back to Career Resources
              </Link>
            </div>

            <ResourceComments resourceId={resource.id} />
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24">

            {headings.length > 0 ? (
              <section className="rounded-xl border border-[#E5EAF1] bg-white p-5">
                <h2 className="text-[16px] font-black text-[#071a35]">
                  On this page
                </h2>

                <nav
                  className="mt-4 border-l-2 border-[#E5EAF1] pl-4"
                  aria-label="On this page"
                >
                  <ul className="space-y-3">
                    {headings.map((heading) => (
                      <li
                        key={heading.id}
                        className={heading.level === 3 ? "pl-3" : ""}
                      >
                        <a
                          href={`#${heading.id}`}
                          className="text-[12px] leading-5 text-[#52657D] transition hover:text-[#D99A2B]"
                        >
                          {heading.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            ) : null}

            {related.length > 0 ? (
              <section className="rounded-xl border border-[#E5EAF1] bg-white p-5">
                <h2 className="text-[16px] font-black text-[#071a35]">
                  Related Reading
                </h2>

                <div className="mt-4 divide-y divide-[#E5EAF1]">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/career-resources/${encodeURIComponent(item.slug)}`}
                      className="block py-4 first:pt-0 last:pb-0"
                    >
                      {item.category ? (
                        <span className="text-[11px] font-bold text-[#16847A]">
                          {item.category}
                        </span>
                      ) : null}

                      <span className="mt-1 block text-[12px] font-bold leading-5 text-[#071a35] transition hover:text-[#D99A2B]">
                        {item.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

          </aside>
        </div>
      </div>
    </main>
  );
}
