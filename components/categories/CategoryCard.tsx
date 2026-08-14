"use client";

import { ChevronRight } from "lucide-react";
import { Category } from "@/types/job";

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryCard({
  category,
  onSelect,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="w-full text-left p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all group flex items-start gap-4"
    >
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
        {Icon ? <Icon className="w-6 h-6" /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {category.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          {category.description}
        </p>

        <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {category.jobCount.toLocaleString()}+ Positions
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </button>
  );
}