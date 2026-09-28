import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Browse Jobs by Category",
  description:
    "Explore job opportunities by category on Horizon Jobs, including technology, healthcare, finance, education, logistics, and more.",
  alternates: {
    canonical: "https://horizonjobs.online/categories",
  },
};import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  DollarSign,
  GraduationCap,
  Headphones,
  HeartPulse,
  Megaphone,
  Palette,
  Scale,
  ShoppingBag,
  Truck,
  Utensils,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";

const categories = [
  { key:"it", name:"IT & Technology", icon:BarChart3, match:/(^|[^a-z])(it|technology|software|computing|data|analytics|developer|programming)([^a-z]|$)/i },
  { key:"healthcare", name:"Healthcare", icon:HeartPulse, match:/(health|healthcare|nursing|nurse|medical|pharma|doctor)/i },
  { key:"logistics", name:"Logistics", icon:Truck, match:/(logistics|warehouse|transport|delivery|supply chain)/i },
  { key:"design", name:"Design & Creative", icon:Palette, match:/(design|creative|graphic|ux|ui)/i },
  { key:"finance", name:"Finance & Accounting", icon:DollarSign, match:/(finance|account|accounting|banking|audit)/i },
  { key:"trades", name:"Trades & Construction", icon:Wrench, match:/(trade|construction|electric|plumb|maintenance|building)/i },
  { key:"customer", name:"Customer Service", icon:Headphones, match:/(customer|client service|call centre|call center)/i },
  { key:"retail", name:"Retail", icon:ShoppingBag, match:/(retail|store|shop|merchand)/i },
  { key:"education", name:"Education", icon:GraduationCap, match:/(education|teaching|teacher|school|training|academic)/i },
  { key:"marketing", name:"Marketing & Sales", icon:Megaphone, match:/(marketing|sales|advertis|public relations|pr jobs)/i },
  { key:"legal", name:"Legal", icon:Scale, match:/(legal|lawyer|solicitor|attorney)/i },
  { key:"hospitality", name:"Hospitality & Catering", icon:Utensils, match:/(hospitality|catering|restaurant|hotel|chef|cook)/i },
] as const;

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [categoryResult, jobsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("name")
      .limit(50),

    supabase
      .from("job_content")
      .select("category_tag,category_label")
      .eq("quality_status", "approved")
      .eq("publication_status", "published")
      .limit(2000),
  ]);

  const rows = (categoryResult.data || []).map(c => ({
    name: String(c.name || ""),
    tag: String(c.slug || "").toLowerCase(),
  }));

  const jobs = jobsResult.data || [];

  const categoryCards = categories.map(category => {
    const matchingRows = rows.filter(row =>
      category.match.test(`${row.name} ${row.tag}`)
    );

    const tags = new Set(
      matchingRows.map(row => row.tag)
    );

    const count = jobs.filter(job => {
      const jobCategory =
        `${job.category_tag || ""} ${job.category_label || ""}`;

      return (
        category.match.test(jobCategory) ||
        tags.has(String(job.category_tag || "").toLowerCase())
      );
    }).length;

    return {
      ...category,
      count,
    };
  });

  return (
    <main className="horizon-page bg-[#F6F8FB]">

      <section className="bg-[#071a35] py-12 text-white md:py-14">
        <div className="horizon-container">
          <p className="horizon-eyebrow">
            Explore by profession
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
            Find work by category
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Browse professional fields and discover published opportunities
            across the Horizon Jobs network.
          </p>
        </div>
      </section>

      <section className="horizon-container py-8 md:py-10">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#b88410]">
              Horizon Jobs categories
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#071a35]">
              All job categories
            </h2>
          </div>

          <span className="shrink-0 text-sm font-semibold text-[#7890AA]">
            {categoryCards.length} categories
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4">

          {categoryCards.map(category => {
            const Icon = category.icon;

            return (
              <Link
                key={category.key}
                href={`/categories/${category.key}`}
                className="group flex min-h-[96px] items-center gap-3 rounded-xl border border-[#E3E8EF] bg-white px-4 py-4 transition-[border-color,box-shadow] duration-150 hover:border-[#3E7BFA] hover:shadow-[0_0_0_1px_#3E7BFA]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2563EB]">
                  <Icon size={20} strokeWidth={1.8} />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-[#0B1526]">
                    {category.name}
                  </span>

                  <span className="mt-1 block text-[12px] text-[#7890AA]">
                    {category.count} published jobs
                  </span>
                </span>
              </Link>
            );
          })}

        </div>

      </section>

    </main>
  );
}



