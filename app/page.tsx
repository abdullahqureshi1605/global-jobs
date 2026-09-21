import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Globe2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { getLatestJobs, type Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase-server";

function one<T>(value: T | T[] | null | undefined): T | null { return Array.isArray(value) ? value[0] ?? null : value ?? null; }
function salary(job: Job) {
  if (job.salary_min == null && job.salary_max == null) return "Salary not specified";
  const c = job.currency ? `${job.currency} ` : "";
  if (job.salary_min != null && job.salary_max != null) return `${c}${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  return job.salary_min != null ? `${c}${job.salary_min.toLocaleString()}+` : `Up to ${c}${job.salary_max!.toLocaleString()}`;
}

async function catalog() {
  const supabase = await createClient();
  const [categories, countries] = await Promise.all([
    supabase.from("categories").select("id,name,slug,icon").order("name").limit(8),
    supabase.from("countries").select("id,name,code").order("name").limit(6),
  ]);
  return { categories: categories.data ?? [], countries: countries.data ?? [] };
}

export default async function HomePage() {
  let jobs: Job[] = [];
  let categories: {id:string;name:string;slug:string;icon?:string|null}[] = [];
  let countries: {id:string;name:string;code:string}[] = [];
  try { jobs = await getLatestJobs(6); } catch {}
  try { ({categories, countries} = await catalog()); } catch {}

  return <div>
    <section className="relative overflow-hidden bg-[#071a35] text-white">
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 80% 15%, rgba(228,173,47,.55), transparent 28%), radial-gradient(circle at 15% 80%, rgba(58,124,255,.25), transparent 30%)"}} />
      <div className="horizon-container relative py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="horizon-eyebrow">Global employment intelligence</div>
          <h1 className="mt-5 text-5xl font-black leading-[1.02] tracking-[-.035em] md:text-7xl">Every opportunity.<br/><span className="text-[#e4ad2f]">One clear horizon.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">Search real job opportunities by role, location and profession. Horizon Jobs brings the discovery experience into one focused platform.</p>

          <form action="/jobs" className="mt-9 grid gap-2 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl md:grid-cols-[1fr_1fr_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4"><Search size={18} className="text-slate-400"/><input name="search" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" placeholder="Job title, company or keyword" /></label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4"><Globe2 size={18} className="text-slate-400"/><input name="location" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" placeholder="Country or city" /></label>
            <button className="h-12 rounded-xl bg-[#e4ad2f] px-7 text-sm font-black text-[#071a35] hover:bg-[#f2c85d]">Search jobs</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-5 text-xs font-semibold text-white/50"><span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#e4ad2f]"/> Database-backed listings</span><span className="inline-flex items-center gap-2"><Sparkles size={15} className="text-[#e4ad2f]"/> Fresh opportunities</span></div>
        </div>
      </div>
    </section>

    <section className="horizon-container horizon-section">
      <SectionHead eyebrow="Recently published" title="Latest opportunities" href="/jobs" action="Browse all jobs" />
      {jobs.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{jobs.map(job => <JobCard key={job.id} job={job}/>)}</div> : <EmptyState title="No published jobs yet" text="The homepage is connected to the jobs database. Published listings will appear here automatically." href="/jobs"/>}
    </section>

    <section className="border-y border-slate-200 bg-white">
      <div className="horizon-container horizon-section"><SectionHead eyebrow="Explore by profession" title="Find work by category" href="/categories" action="All categories"/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map(c=><Link key={c.id} href={`/categories/${c.slug}`} className="horizon-card horizon-card-hover group p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a35] text-lg font-black text-[#e4ad2f]">{c.icon || c.name.charAt(0)}</div><h3 className="mt-5 font-black text-[#071a35]">{c.name}</h3><p className="mt-1 text-xs text-slate-500">Explore available roles</p><ArrowRight size={17} className="mt-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#e4ad2f]"/></Link>)}</div>{!categories.length && <EmptyState title="Categories are not available yet" text="Connect the Supabase catalog and categories will appear here." href="/categories"/>}</div>
    </section>

    <section className="horizon-container horizon-section"><SectionHead eyebrow="Global opportunities" title="Explore by country" href="/countries" action="All countries"/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{countries.map(c=><Link key={c.id} href={`/countries/${c.code.toLowerCase()}`} className="horizon-card horizon-card-hover flex items-center justify-between p-5"><div><h3 className="font-black text-[#071a35]">{c.name}</h3><p className="mt-1 text-xs text-slate-500">Browse opportunities in {c.name}</p></div><span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">{c.code}</span></Link>)}</div>{!countries.length && <EmptyState title="Countries are not available yet" text="The country catalog will appear when records are available in Supabase." href="/countries"/>}</section>

    <section className="bg-[#071a35] py-14 text-white"><div className="horizon-container flex flex-col justify-between gap-7 md:flex-row md:items-center"><div><p className="horizon-eyebrow">For job seekers</p><h2 className="mt-3 text-3xl font-black">Your next move starts here.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Create an account to manage applications and build your candidate profile.</p></div><div className="flex flex-wrap gap-3"><Link href="/signup" className="horizon-button horizon-button-gold">Create account <ArrowRight size={17}/></Link><Link href="/recruiters" className="horizon-button border border-white/15 bg-white/5 text-white">I'm hiring</Link></div></div></section>
  </div>;
}
function SectionHead({eyebrow,title,href,action}:{eyebrow:string;title:string;href:string;action:string}) { return <div className="mb-7 flex items-end justify-between gap-4"><div><p className="horizon-eyebrow">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#071a35]">{title}</h2></div><Link href={href} className="hidden items-center gap-1 text-sm font-black text-[#071a35] hover:text-[#b88410] sm:flex">{action}<ArrowRight size={16}/></Link></div> }
function JobCard({job}:{job:Job}) { const company=one(job.companies); const category=one(job.categories); return <Link href={`/jobs/${job.slug}`} className="horizon-card horizon-card-hover block p-5"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#071a35] text-lg font-black text-[#e4ad2f]">{company?.name?.charAt(0) || "J"}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="font-black leading-5 text-[#071a35]">{job.title}</h3><BriefcaseBusiness size={17} className="shrink-0 text-slate-300"/></div><p className="mt-1 text-sm text-slate-500">{company?.name || "Employer"}</p><div className="mt-4 flex flex-wrap gap-2">{category?.name && <Badge>{category.name}</Badge>}{job.city && <Badge>{job.city}</Badge>}{job.work_mode && <Badge>{job.work_mode}</Badge>}</div><div className="mt-5 border-t border-slate-100 pt-4 text-sm font-black text-[#071a35]">{salary(job)}</div></div></div></Link> }
function Badge({children}:{children:React.ReactNode}) { return <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{children}</span> }
function EmptyState({title,text,href}:{title:string;text:string;href:string}) { return <div className="horizon-card p-10 text-center"><h3 className="text-lg font-black text-[#071a35]">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{text}</p><Link href={href} className="horizon-button horizon-button-outline mt-5">Open page</Link></div> }
