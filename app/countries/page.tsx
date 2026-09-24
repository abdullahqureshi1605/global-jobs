import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Jobs by Country",
  description:
    "Explore job opportunities by country and discover employment options worldwide on Horizon Jobs.",
  alternates: {
    canonical: "https://horizonjobs.online/countries",
  },
};import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
export default async function CountriesPage(){
  const supabase=await createClient();

  const [{data,error},{data:jobRows}]=await Promise.all([
    supabase.from("countries").select("id,name,code").order("name"),
    supabase.from("job_content").select("location_display").eq("quality_status","approved").eq("publication_status","published").limit(5000)
  ]);

  const countries=data??[];
  const jobs=jobRows??[];

  const usStates="AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC";
  const countryPatterns:Record<string,RegExp>={
    US:new RegExp("\\b(united states|usa|"+usStates+"|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|ohio|oklahoma|oregon|pennsylvania|tennessee|texas|utah|vermont|virginia|washington|wisconsin|wyoming|new york|new jersey|new mexico|north carolina|south carolina|north dakota|south dakota|west virginia|rhode island|new hampshire|los angeles|san francisco|san diego|seattle|chicago|austin|boston|denver|phoenix|atlanta|dallas|houston|miami|liberty lake|veradale|jersey city)\\b","i"),
    CA:/\b(canada|ontario|quebec|alberta|british columbia|manitoba|saskatchewan|nova scotia|new brunswick|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg|quebec city)\b/i,
    AU:/\b(australia|new south wales|victoria|queensland|western australia|south australia|tasmania|sydney|melbourne|brisbane|perth|adelaide|canberra|gold coast)\b/i,
    GB:/\b(united kingdom|england|scotland|wales|northern ireland|london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|bristol)\b/i,
    PK:/\b(pakistan|islamabad|rawalpindi|lahore|karachi|peshawar|abbottabad|multan|quetta|faisalabad|sialkot|hyderabad)\b/i,
    DE:/\b(germany|berlin|munich|hamburg|frankfurt|cologne|stuttgart|dusseldorf|dresden)\b/i,
    FR:/\b(france|paris|lyon|marseille|toulouse|nice|bordeaux|lille)\b/i,
    IN:/\b(india|delhi|new delhi|mumbai|bangalore|bengaluru|hyderabad|chennai|pune|kolkata|ahmedabad)\b/i,
    MY:/\b(malaysia|kuala lumpur|penang|johor|selangor|putrajaya|malacca|ipoh)\b/i,
    PH:/\b(philippines|manila|cebu|davao)\b/i,
    SG:/\b(singapore)\b/i,
    AE:/\b(united arab emirates|uae|dubai|abu dhabi|sharjah)\b/i,
    SA:/\b(saudi arabia|riyadh|jeddah|dammam|mecca|medina)\b/i
  };

  const jobCounts:Record<string,number>={};

  for(const country of countries){
    const code=String(country.code||"").toUpperCase();
    const pattern=countryPatterns[code];

    jobCounts[code]=pattern
      ? jobs.filter(job=>pattern.test(String(job.location_display||""))).length
      : 0;
  }

  return (
    <main className="horizon-page">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow">Global opportunities</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Explore by country</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Discover opportunities from the live country catalog.
          </p>
        </div>
      </section>

      <section className="horizon-container horizon-section">
        {error ? (
          <div className="horizon-card border-red-200 bg-red-50 p-7 text-sm text-red-700">
            Unable to load countries. Check the Supabase connection.
          </div>
        ) : countries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map(c=>{
              const code=String(c.code||"").toUpperCase();
              const count=jobCounts[code]??0;

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
                    {count.toLocaleString()} {count===1 ? "job" : "jobs"}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="horizon-card p-12 text-center">
            <Globe2 className="mx-auto text-slate-300" size={40}/>
            <h2 className="mt-4 font-black">No countries available</h2>
            <p className="mt-2 text-sm text-slate-500">
              No country records are currently available.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}


