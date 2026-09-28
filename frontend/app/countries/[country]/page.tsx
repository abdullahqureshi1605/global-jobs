import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getPublishedJobs, type Job } from "@/lib/jobs";
import PublicJobCard from "@/components/PublicJobCard";

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

const currencies: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  PK: "PKR",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  IE: "EUR",
  NZ: "NZD",
  IN: "INR",
  PH: "PHP",
  SG: "SGD",
  JP: "JPY",
  AE: "AED",
  SA: "SAR",
  MY: "MYR",
};

function salaryText(job: Job, countryCode: string) {
  if (job.salary_min == null && job.salary_max == null) {
    return "Salary not specified";
  }

  const currency = job.currency || currencies[countryCode] || "";

  const clean = (value: number) => {
    const n = Math.trunc(value);

    if (n >= 1000) {
      return `${Math.round(n / 1000)}k`;
    }

    return n.toLocaleString("en-US");
  };

  if (job.salary_min != null && job.salary_max != null) {
    return `${clean(job.salary_min)} – ${clean(job.salary_max)} ${currency}`.trim();
  }

  if (job.salary_min != null) {
    return `${clean(job.salary_min)}+ ${currency}`.trim();
  }

  return `Up to ${clean(job.salary_max!)} ${currency}`.trim();
}

function getWorkMode(job: Job) {
  const text = `${job.work_mode || ""} ${job.title || ""} ${job.summary || ""} ${job.description || ""}`.toLowerCase();

  if (text.includes("hybrid")) {
    return "Hybrid";
  }

  if (text.includes("remote") || text.includes("work from home")) {
    return "Remote";
  }

  return "On-site";
}


export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { country } = await params;
  const { page } = await searchParams;

  const supabase = await createClient();

  const { data: countries } = await supabase
    .from("countries")
    .select("id,name,code");

  const c = (countries ?? []).find(
    (item) => item.code.toLowerCase() === country.toLowerCase()
  );

  if (!c) {
    notFound();
  }

  let jobs: Job[] = [];

  try {
    const publishedJobs = await getPublishedJobs("", "", 2000, "");
    jobs = publishedJobs.filter((job) => {
      const code = one(job.countries)?.code?.toLowerCase() || "";
      return code === c.code.toLowerCase();
    });
  } catch {}

  const pageSize = 20;
  const requestedPage =
    typeof page === "string" ? Number.parseInt(page, 10) || 1 : 1;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedJobs = jobs.slice(startIndex, startIndex + pageSize);

  const pageHref = (pageNumber: number) =>
    pageNumber === 1
      ? `/countries/${c.code.toLowerCase()}`
      : `/countries/${c.code.toLowerCase()}?page=${pageNumber}`;

  return (
    <main className="horizon-page">
      <section className="bg-[#071a35] py-7 text-white md:py-8">
        <div className="horizon-container">
<div className="mt-5 flex items-center gap-4">
            <span
              className={`fi fi-${c.code.toLowerCase()} h-7 w-9 shrink-0 rounded-sm`}
              aria-label={c.name}
            />

            <div>
              <p className="horizon-eyebrow">Country</p>

              <h1 className="mt-1 text-3xl font-black md:text-4xl">
                Jobs in {c.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="horizon-container py-5 md:py-6">
        {jobs.length ? (
          <>
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedJobs.map((job) => (
              <PublicJobCard
                key={job.id}
                job={job}
                href={`/countries/${c.code.toLowerCase()}/jobs/${job.slug}`}
                countryCode={c.code}
              />
            ))}
          </div>

          {totalPages >= 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
              aria-label="Country jobs pagination"
            >
              {currentPage > 1 ? (
              <Link
                  href={pageHref(currentPage - 1)}
                  className="rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#45617F] transition hover:border-[#3E7BFA] hover:text-[#2563EB]"
                >
                  Previous
                </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] px-3 py-2 text-[12px] font-bold text-[#A7B3C3]"
              >
                Previous
              </span>
            )}

              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, index) =>
                  Math.max(
                    1,
                    Math.min(currentPage - 4, totalPages - 4)
                  ) + index
              ).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={pageHref(pageNumber)}
                  aria-current={
                    pageNumber === currentPage ? "page" : undefined
                  }
                  className={
                    pageNumber === currentPage
                      ? "rounded-lg bg-[#3E7BFA] px-3 py-2 text-[12px] font-bold !text-white shadow-sm"
                      : "rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#45617F] transition hover:border-[#3E7BFA] hover:text-[#2563EB]"
                  }
                >
                  {pageNumber}
                </Link>
              ))}

              {currentPage < totalPages ? (
              <Link
                  href={pageHref(currentPage + 1)}
                  className="rounded-lg border border-[#D5DDE8] bg-white px-3 py-2 text-[12px] font-bold text-[#45617F] transition hover:border-[#3E7BFA] hover:text-[#2563EB]"
                >
                  Next
                </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] px-3 py-2 text-[12px] font-bold text-[#A7B3C3]"
              >
                Next
              </span>
            )}
            </nav>
          )}
          </>
        ) : (
          <div className="horizon-card p-12 text-center">
            <h2 className="font-black text-[#071a35]">
              No published jobs in {c.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Check back later for new opportunities.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}






