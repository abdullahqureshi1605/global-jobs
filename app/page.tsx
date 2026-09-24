import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Find Jobs Worldwide",
  description:
    "Find jobs and career opportunities worldwide with Horizon Jobs. Search jobs by title, company, category, country, and location.",
  alternates: {
    canonical: "https://horizonjobs.online/",
  },
};import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Globe2, Search, ShieldCheck, Sparkles, BarChart3, HeartPulse, Truck, Palette, DollarSign, Wrench, Headphones, ShoppingBag, GraduationCap, Megaphone, Scale, Utensils, Factory, UsersRound, MapPin } from "lucide-react";;
import { getLatestJobs, type Job } from "@/lib/jobs";
import PublicJobCard from "@/components/PublicJobCard";
import { createClient } from "@/lib/supabase-server";

function one<T>(value: T | T[] | null | undefined): T | null { return Array.isArray(value) ? value[0] ?? null : value ?? null; }
function CategoryIcon({icon}:{icon?:string|null}) {
  if (icon === "healthcare") return <HeartPulse size={20} strokeWidth={1.8}/>;
  if (icon === "logistics") return <Truck size={20} strokeWidth={1.8}/>;
  if (icon === "design") return <Palette size={20} strokeWidth={1.8}/>;
  if (icon === "finance") return <DollarSign size={20} strokeWidth={1.8}/>;
  if (icon === "trades") return <Wrench size={20} strokeWidth={1.8}/>;
  if (icon === "customer") return <Headphones size={20} strokeWidth={1.8}/>;
  if (icon === "retail") return <ShoppingBag size={20} strokeWidth={1.8}/>;
  if (icon === "education") return <GraduationCap size={20} strokeWidth={1.8}/>;
  if (icon === "marketing") return <Megaphone size={20} strokeWidth={1.8}/>;
  if (icon === "legal") return <Scale size={20} strokeWidth={1.8}/>;
  if (icon === "hospitality") return <Utensils size={20} strokeWidth={1.8}/>;
  if (icon === "manufacturing") return <Factory size={20} strokeWidth={1.8}/>;
  if (icon === "hr") return <UsersRound size={20} strokeWidth={1.8}/>;
  return <BarChart3 size={20} strokeWidth={1.8}/>;
}


function salary(job: Job) {
  if (job.salary_min == null && job.salary_max == null) return "Salary not specified";
  const c = job.currency ? `${job.currency} ` : "";
  if (job.salary_min != null && job.salary_max != null) return `${c}${job.salary_min.toLocaleString()} â€“ ${job.salary_max.toLocaleString()}`;
  return job.salary_min != null ? `${c}${job.salary_min.toLocaleString()}+` : `Up to ${c}${job.salary_max!.toLocaleString()}`;
}

async function catalog() {
  const supabase = await createClient();

  const [categoryResult, jobsResult, countries] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name").limit(50),
    supabase.from("job_content").select("category_tag,category_label,location_display").eq("quality_status","approved").eq("publication_status","published").limit(2000),
    supabase.from("countries").select("id,name,code").order("name").limit(6),
  ]);

  const rows=(categoryResult.data || []).map(c => ({
    id:c.id,
    name:c.name,
    slug:c.slug,
    label:(c.name || "").toLowerCase(),
    tag:(c.slug || "").toLowerCase()
  }));

  const jobs=jobsResult.data || [];

  const definitions=[
    {key:"it",name:"IT & Technology",match:/(^|[^a-z])(it|technology|software|computing|data|analytics|developer|programming)([^a-z]|$)/i},
    {key:"healthcare",name:"Healthcare",match:/(health|healthcare|nursing|nurse|medical|pharma|doctor)/i},
    {key:"logistics",name:"Logistics",match:/(logistics|warehouse|transport|delivery|supply chain)/i},
    {key:"design",name:"Design & Creative",match:/(design|creative|graphic|ux|ui)/i},
    {key:"finance",name:"Finance & Accounting",match:/(finance|account|accounting|banking|audit)/i},
    {key:"trades",name:"Trades & Construction",match:/(trade|construction|electric|plumb|maintenance|building)/i},
    {key:"customer",name:"Customer Service",match:/(customer|client service|call centre|call center)/i},
    {key:"retail",name:"Retail",match:/(retail|store|shop|merchand)/i},
    {key:"education",name:"Education",match:/(education|teaching|teacher|school|training|academic)/i},
    {key:"marketing",name:"Marketing & Sales",match:/(marketing|sales|advertis|public relations|pr jobs)/i},
    {key:"legal",name:"Legal",match:/(legal|lawyer|solicitor|attorney)/i},
    {key:"hospitality",name:"Hospitality & Catering",match:/(hospitality|catering|restaurant|hotel|chef|cook)/i},
    {key:"manufacturing",name:"Manufacturing",match:/(manufactur|production|factory|assembly|machine operator)/i},
    {key:"hr",name:"HR & Recruitment",match:/(human resources|\bhr\b|recruit|talent)/i}
  ];  const result=definitions.map(def => {
    const matches=rows.filter(r => def.match.test(`${r.label} ${r.tag}`));

    const tags=new Set(
      matches.map(m => String(m.tag || "").toLowerCase())
    );

    const count=jobs.filter(j => {
      const jobCategory=`${j.category_tag || ""} ${j.category_label || ""}`;

      return (
        def.match.test(jobCategory) ||
        tags.has(String(j.category_tag || "").toLowerCase())
      );
    }).length;

    return {
      id:`curated-${def.key}`,
      name:def.name,
      slug:def.key,
      icon:def.key,
      count
    };
  }) as {id:string;name:string;slug:string;icon:string;count:number}[];

  return {
    categories:result.slice(0,12),
    countries:(countries.data ?? []).map(c => {
      const code=String(c.code || "").toUpperCase();
      const countryPatterns:Record<string,RegExp>={
        US:/\b(united states|usa|new york|california|texas|florida|washington|chicago|austin|seattle|boston|denver|phoenix|atlanta|dallas|houston|los angeles|san francisco|miami|liberty lake|veradale|jersey city)\b/i,
        CA:/\b(canada|ontario|quebec|alberta|british columbia|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg)\b/i,
        AU:/\b(australia|new south wales|victoria|queensland|western australia|sydney|melbourne|brisbane|perth|adelaide|canberra)\b/i,
        GB:/\b(united kingdom|england|scotland|wales|london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh)\b/i,
        PK:/\b(pakistan|islamabad|rawalpindi|lahore|karachi|peshawar|abbottabad|multan|quetta|faisalabad|sialkot)\b/i,
        DE:/\b(germany|berlin|munich|hamburg|frankfurt|cologne|stuttgart|dusseldorf)\b/i,
        FR:/\b(france|paris|lyon|marseille|toulouse|nice|bordeaux|lille)\b/i,
        IN:/\b(india|delhi|new delhi|mumbai|bangalore|bengaluru|hyderabad|chennai|pune|kolkata|ahmedabad)\b/i,
        MY:/\b(malaysia|kuala lumpur|penang|johor|selangor|putrajaya|malacca|ipoh)\b/i,
        PH:/\b(philippines|manila|cebu|davao)\b/i,
        SG:/\b(singapore)\b/i,
        AE:/\b(united arab emirates|uae|dubai|abu dhabi|sharjah)\b/i,
        SA:/\b(saudi arabia|riyadh|jeddah|dammam|mecca|medina)\b/i
      };
      const pattern=countryPatterns[code];
      const count=pattern
        ? jobs.filter(j => pattern.test(String(j.location_display || ""))).length
        : 0;
      return {...c,count};
    })
  };
}
export default async function HomePage() {
  let jobs: Job[] = [];
  let categories: {id:string;name:string;slug:string;icon?:string|null;count:number}[] = [];
  let countries: {id:string;name:string;code:string;count:number}[] = [];
  try { jobs = await getLatestJobs(6); } catch {}
  try { ({categories, countries} = await catalog()); } catch {}

  return <div>
    <section className="relative overflow-hidden bg-[#0B1526] text-white">
      <div className="absolute inset-0 opacity-30" style={{backgroundImage:"radial-gradient(circle at 50% 110%, rgba(226,163,61,.65), transparent 38%), radial-gradient(circle at 80% 20%, rgba(62,123,250,.16), transparent 32%)"}} />
      <div className="horizon-container relative pt-16 pb-24 md:pt-[76px] md:pb-[112px]">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="horizon-eyebrow">Global employment intelligence</div>
          <h1 className="mt-3 leading-[1.08] tracking-[-.02em]"><span className="block text-[38px] sm:hidden">Find your next<br/><span className="text-[#E2A33D]">opportunity.</span></span><span className="hidden text-4xl sm:block md:text-[48px]">Every opportunity.<br/><span className="text-[#E2A33D]">One clear horizon.</span></span></h1>
          <div className="mx-auto mt-4 max-w-[650px] text-white/70"><p className="text-[15px] leading-6 sm:hidden">Search jobs worldwide by role and location.</p><p className="hidden text-[15px] leading-6 sm:block md:text-[17px] md:leading-7">Search real job opportunities by role, location and profession. Horizon Jobs brings the discovery experience into one focused platform.</p></div>

          <form action="/jobs" className="mx-auto mt-7 grid w-full max-w-[640px] gap-1.5 rounded-[10px] border border-white/10 bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,.14)] md:grid-cols-[1fr_1fr_auto]">
            <label className="flex items-center rounded-md border border-transparent bg-white px-3"><input name="search" className="h-11 min-w-0 w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Job title, company, or keyword" /></label>
            <label className="flex items-center rounded-md border border-transparent bg-white px-3"><input name="location" className="h-11 min-w-0 w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Country or city" /></label>
            <button className="h-11 rounded-md bg-[#3E7BFA] px-6 text-sm font-bold text-white hover:bg-[#3269dc]">Search jobs</button>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs font-semibold text-white/55"><span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#e4ad2f]"/> Database-backed listings</span><span className="inline-flex items-center gap-2"><Sparkles size={15} className="text-[#e4ad2f]"/> Fresh opportunities</span></div>
        </div>
      </div>
    </section>

    <section className="horizon-container horizon-section">
      <SectionHead eyebrow="Recently published" title="Latest opportunities" />
      {jobs.length ? <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.slice(0, 6).map(job => <JobCard key={job.id} job={job}/>)}</div> : <EmptyState title="No published jobs yet" text="The homepage is connected to the jobs database. Published listings will appear here automatically." href="/jobs"/>}
      <div className="mt-5 flex justify-center"><Link href="/jobs" className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-6 py-3 text-[13px] font-bold !text-white mb-2 hover:bg-[#1D4ED8]">View All Jobs <ArrowRight size={15}/></Link></div>
    </section>
    
    <section className="border-y border-slate-200 bg-white">
      <div className="horizon-container horizon-section">
        <SectionHead eyebrow="Explore by profession" title="Find work by category"/>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {categories.slice(0, 6).map(c => {


            return (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group flex min-h-[96px] items-center gap-3 rounded-xl border border-[#E3E8EF] bg-white px-4 py-4 transition-[border-color,box-shadow] duration-150 hover:border-[#3E7BFA] hover:shadow-[0_0_0_1px_#3E7BFA]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2563EB]">
                  <CategoryIcon icon={c.icon}/>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-[#0B1526]">{c.name}</span>
                  <span className="mt-1 block text-[12px] text-[#7890AA]">{c.count} published jobs</span>
                </span>
              </Link>
            );
          })}
        </div>
        {!categories.length && <EmptyState title="Categories are not available yet" text="Connect the Supabase catalog and categories will appear here." href="/categories"/>}
      </div>
        <div className="flex justify-center"><Link href="/categories" className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-6 py-3 text-[13px] font-bold !text-white mb-2 hover:bg-[#1D4ED8]">View All Categories <ArrowRight size={15}/></Link></div>
        </section>
        <section className="horizon-container horizon-section">
      <SectionHead eyebrow="Global opportunities" title="Explore by country"/>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {countries.slice(0, 6).map(c => {
          const code=String(c.code || "").toUpperCase();

          return (
            <Link
              key={c.id}
              href={`/countries/${code.toLowerCase()}`}
              className="horizon-card horizon-card-hover group flex items-center justify-between p-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className={`fi fi-${code.toLowerCase()} h-7 w-9 shrink-0 rounded-sm`}
                  aria-label={c.name}
                />
                <div className="min-w-0">
                  <h2 className="font-black text-[#071a35]">{c.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Browse opportunities in {c.name}
                  </p>
                </div>
              </div>

              <span className="ml-4 shrink-0 rounded-full bg-[#EEF1F5] px-3 py-1.5 text-sm font-semibold text-[#45617F]">
                {c.count.toLocaleString()} {c.count === 1 ? "job" : "jobs"}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-5 flex justify-center"><Link href="/countries" className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-6 py-3 text-[13px] font-bold !text-white mb-2 hover:bg-[#1D4ED8]">View All Countries <ArrowRight size={15}/></Link></div>
    </section>

        <section className="horizon-container horizon-section">
      <div className="rounded-[26px] bg-[#071a35] px-7 py-7 text-white md:px-10 md:py-8">
        <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="font-serif text-xl font-semibold leading-tight tracking-tight md:text-2xl">
              Get job alerts delivered to your inbox
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-[#AFC0D8] md:text-sm">
              Choose your countries and categories once — we'll tell you the moment something matching goes live.
            </p>
          </div>

          <form
            action="/signup"
            method="get"
            className="flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:min-w-[500px]"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white px-4 py-2.5 text-sm text-[#071a35] outline-none placeholder:text-[#7890AA] focus:border-[#E4AD2F]"
            />
            <input type="hidden" name="redirect" value="/job-alerts" />
            <button
              type="submit"
              className="rounded-lg bg-[#3E7BFA] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#F0BA3D]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>;
}
function SectionHead({eyebrow,title}:{eyebrow:string;title:string}) { return <div className="mb-5"><p className="horizon-eyebrow">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#071a35]">{title}</h2></div> }
function JobCard({job}:{job:Job}) {
  return <PublicJobCard job={job} />;
}
function Badge({children}:{children:React.ReactNode}) { return <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{children}</span> }
function EmptyState({title,text,href}:{title:string;text:string;href:string}) { return <div className="horizon-card p-10 text-center"><h3 className="text-lg font-black text-[#071a35]">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{text}</p><Link href={href} className="horizon-button horizon-button-outline mt-5">Open page</Link></div> }











































