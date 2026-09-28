import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CareerResource = {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

async function getResources(): Promise<CareerResource[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("career_resources")
    .select(
      "id,title,slug,body,category,published_at,created_at"
    )
    .not("published_at", "is", null)
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Career Resources database error:",
      error
    );

    throw new Error(
      `Failed to load career resources: ${error.message}`
    );
  }

  return (data ?? []) as CareerResource[];
}

export default async function CareerResourcesPage() {
  const resources = await getResources();

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="max-w-3xl">

            <div className="mb-5 flex items-center gap-3 text-cyan-400">
              <BookOpen size={24} />

              <span className="text-sm font-bold uppercase tracking-[0.2em]">
                Career Resources
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Career Guides & Job Search Resources
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Practical career information, job-search guidance,
              interview preparation, and professional development
              resources.
            </p>

          </div>

        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 py-12">

        {resources.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <BookOpen
              size={36}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-5 text-xl font-bold">
              No published career resources yet
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Career resources will appear here after they
              are created and published from the administration
              panel.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {resources.map((resource) => (

              <article
                key={resource.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500/40"
              >

                <div className="flex items-center justify-between gap-3">

                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {resource.category || "Career Guide"}
                  </span>

                  {resource.published_at && (
                    <time
                      dateTime={resource.published_at}
                      className="text-xs text-slate-500"
                    >
                      {new Date(
                        resource.published_at
                      ).toLocaleDateString()}
                    </time>
                  )}

                </div>


                <h2 className="mt-5 text-xl font-bold leading-7 text-white group-hover:text-cyan-300">
                  {resource.title}
                </h2>


                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
                  {resource.body}
                </p>


                <div className="mt-auto pt-6">

                  <Link
                    href={`/career-resources/${encodeURIComponent(resource.slug)}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Read Guide
                    <ArrowRight size={16} />
                  </Link>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}