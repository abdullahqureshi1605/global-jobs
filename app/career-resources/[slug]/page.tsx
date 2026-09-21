import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getCareerResourceBySlug } from "@/lib/career-resources";

export const dynamic = "force-dynamic";

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

  return (
    <main className="horizon-page">
      <div className="horizon-container py-12 sm:py-16">

        <Link
          href="/career-resources"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#071a35]"
        >
          <ArrowLeft size={15} />
          Career resources
        </Link>

        <article className="mx-auto mt-8 max-w-4xl horizon-card p-7 sm:p-10 lg:p-12">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#071a35] text-[#e4ad2f]">
            <BookOpen size={22} />
          </div>

          {resource.category ? (
            <p className="horizon-eyebrow mt-7">
              {resource.category}
            </p>
          ) : null}

          <h1 className="mt-2 text-3xl font-black leading-tight text-[#07152d] sm:text-4xl lg:text-5xl">
            {resource.title}
          </h1>

          {resource.published_at ? (
            <p className="mt-4 text-sm font-semibold text-slate-400">
              Published{" "}
              {new Date(resource.published_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          ) : null}

          <div className="mt-8 border-t border-slate-200 pt-8">
            <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
              {resource.body}
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
