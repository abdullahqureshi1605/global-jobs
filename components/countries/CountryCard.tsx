import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { Country } from "@/types/job";

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({
  country,
}: CountryCardProps) {
  return (
    <Link
      href={`/jobs/${country.slug}`}
      className="w-full text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all group flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{country.flag}</span>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {country.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5" />

            <span>
              {country.popularCities.slice(0, 2).join(" • ")}
            </span>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {country.jobCount.toLocaleString()}+ roles
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}