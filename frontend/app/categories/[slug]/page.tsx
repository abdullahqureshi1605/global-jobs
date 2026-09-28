import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, MapPin } from "lucide-react";
import { getPublishedJobs, type Job } from "@/lib/jobs";
import PublicJobCard from "@/components/PublicJobCard";

const categories = [
  { key:"it", name:"IT & Technology", match:/(^|[^a-z])(it|technology|software|computing|data|analytics|developer|programming)([^a-z]|$)/i },
  { key:"healthcare", name:"Healthcare", match:/(health|healthcare|nursing|nurse|medical|pharma|doctor)/i },
  { key:"logistics", name:"Logistics", match:/(logistics|warehouse|transport|delivery|supply chain)/i },
  { key:"design", name:"Design & Creative", match:/(design|creative|graphic|ux|ui)/i },
  { key:"finance", name:"Finance & Accounting", match:/(finance|account|accounting|banking|audit)/i },
  { key:"trades", name:"Trades & Construction", match:/(trade|construction|electric|plumb|maintenance|building)/i },
  { key:"customer", name:"Customer Service", match:/(customer|client service|call centre|call center)/i },
  { key:"retail", name:"Retail", match:/(retail|store|shop|merchand)/i },
  { key:"education", name:"Education", match:/(education|teaching|teacher|school|training|academic)/i },
  { key:"marketing", name:"Marketing & Sales", match:/(marketing|sales|advertis|public relations|pr jobs)/i },
  { key:"legal", name:"Legal", match:/(legal|lawyer|solicitor|attorney)/i },
  { key:"hospitality", name:"Hospitality & Catering", match:/(hospitality|catering|restaurant|hotel|chef|cook)/i },
] as const;

function one<T>(value:T|T[]|null|undefined):T|null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getCountryCode(job:Job) {
  const location=(job.city || one(job.countries)?.name || "").toLowerCase();

  if(/\b(liberty lake|veradale|jersey city|austin|new york|seattle|chicago|houston|dallas|boston|denver|phoenix|los angeles|san francisco|miami|atlanta)\b/i.test(location)) return "US";
  if(/\b(canada|toronto|vancouver|montreal|calgary|ottawa)\b/i.test(location)) return "CA";
  if(/\b(australia|sydney|melbourne|brisbane|perth|canberra)\b/i.test(location)) return "AU";
  if(/\b(united kingdom|london|manchester|birmingham|glasgow|edinburgh)\b/i.test(location)) return "GB";
  if(/\b(pakistan|islamabad|lahore|karachi|peshawar|abbottabad)\b/i.test(location)) return "PK";
  if(/\b(germany|berlin|munich|hamburg|frankfurt)\b/i.test(location)) return "DE";
  if(/\b(france|paris|lyon|marseille)\b/i.test(location)) return "FR";
  if(/\b(india|delhi|mumbai|bangalore|hyderabad|chennai)\b/i.test(location)) return "IN";

  return null;
}

function money(job:Job) {
  if(job.salary_min == null && job.salary_max == null) return "Salary not specified";

  const code=getCountryCode(job);

  const currencies:Record<string,string> = {
    US:"USD", CA:"CAD", AU:"AUD", GB:"GBP", PK:"PKR",
    DE:"EUR", FR:"EUR", IN:"INR"
  };

  const currency=job.currency || (code ? currencies[code] : "");

  const clean=(value:number) => Math.trunc(value).toLocaleString("en-US");

  if(job.salary_min != null && job.salary_max != null)
    return `${clean(job.salary_min)} – ${clean(job.salary_max)}${currency ? ` ${currency}` : ""}`;

  if(job.salary_min != null)
    return `${clean(job.salary_min)}+${currency ? ` ${currency}` : ""}`;

  return `Up to ${clean(job.salary_max!)}${currency ? ` ${currency}` : ""}`;
}

function workMode(job:Job) {
  const text=`${job.title || ""} ${job.summary || ""} ${job.description || ""}`.toLowerCase();

  if(job.work_mode) {
    const value=job.work_mode.toLowerCase();
    if(value.includes("remote")) return "Remote";
    if(value.includes("hybrid")) return "Hybrid";
    return "On-site";
  }

  if(text.includes("hybrid")) return "Hybrid";
  if(text.includes("remote") || text.includes("work from home")) return "Remote";

  return "On-site";
}

export default async function CategoryPage({
  params,
  searchParams,
}:{
  params:Promise<{slug:string}>
  searchParams:Promise<{page?:string}>
}) {
  const {slug}=await params;
  const {page}=await searchParams;

  const category=categories.find(c=>c.key===slug.toLowerCase());

  if(!category) notFound();

  let jobs:Job[]=[];

  try {
    jobs=await getPublishedJobs("", "", 2000, "");
  } catch {}

  const categoryJobs = jobs.filter(job => {
    const categoryName = one(job.categories)?.name || "";
    const categorySlug = one(job.categories)?.slug || "";
    return category.match.test(`${categoryName} ${categorySlug}`);
  });

  const pageSize = 20;
  const requestedPage =
    typeof page === "string" ? Number.parseInt(page, 10) || 1 : 1;
  const totalPages = Math.max(1, Math.ceil(categoryJobs.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedCategoryJobs = categoryJobs.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageHref = (pageNumber: number) =>
    pageNumber === 1
      ? `/categories/${category.key}`
      : `/categories/${category.key}?page=${pageNumber}`;

  return (
    <main className="horizon-page bg-[#F6F8FB]">

      <section className="bg-[#071a35] py-7 text-white md:py-8">
        <div className="horizon-container">
<div className="mt-5 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2563EB]">
              <BriefcaseBusiness size={21}/>
            </span>

            <div>
              <p className="horizon-eyebrow">Category</p>
              <h1 className="mt-1 text-3xl font-black md:text-4xl">
                {category.name}
              </h1>
            </div>
          </div>

        </div>
      </section>

      <section className="horizon-container py-6 md:py-7">

        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[.15em] text-[#b88410]">
            Published opportunities
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#071a35]">
            {categoryJobs.length} available jobs
          </h2>
        </div>

        {categoryJobs.length ? (
          <>
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">

            {pagedCategoryJobs.map(job => (
              <PublicJobCard
                key={job.id}
                job={job}
                href={`/categories/${category.key}/jobs/${job.slug}`}
              />
            ))}

          </div>

          {totalPages >= 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
              aria-label="Category jobs pagination"
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
                {
                  length: Math.min(5, totalPages),
                },
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
            <BriefcaseBusiness
              className="mx-auto text-slate-300"
              size={40}
            />

            <h3 className="mt-4 font-black text-[#071a35]">
              No jobs in this category
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no published listings for this category.
            </p>
          </div>
        )}

      </section>
    </main>
  );
}








