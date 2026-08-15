import { unstable_cache } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type CountryCount = {
  country: string;
  countryCode: string;
  count: number;
};

export type CategoryCount = {
  category: string;
  count: number;
};

interface CountryRow {
  country: string;
  country_code: string | null;
  job_count: number;
}

interface CategoryRow {
  category: string;
  job_count: number;
}

const getCachedCountryCounts =
  unstable_cache(
    async (): Promise<
      CountryCount[]
    > => {
      const {
        data,
        error,
      } = await supabaseAdmin.rpc(
        "get_published_country_counts"
      );

      if (error) {
        throw new Error(
          `Failed to load country counts: ${error.message}`
        );
      }

      const rows =
        (data ?? []) as CountryRow[];

      return rows
        .filter(
          (row) =>
            typeof row.country ===
              "string" &&
            row.country.trim() !== ""
        )
        .map(
          (row) => ({
            country:
              row.country.trim(),

            countryCode:
              typeof row.country_code ===
              "string"
                ? row.country_code
                    .trim()
                    .toUpperCase()
                : "",

            count:
              Number(
                row.job_count
              ),
          })
        );
    },
    [
      "horizon-country-counts-v3",
    ],
    {
      revalidate: 300,
    }
  );

const getCachedCategoryCounts =
  unstable_cache(
    async (): Promise<
      CategoryCount[]
    > => {
      const {
        data,
        error,
      } = await supabaseAdmin.rpc(
        "get_published_category_counts"
      );

      if (error) {
        throw new Error(
          `Failed to load category counts: ${error.message}`
        );
      }

      const rows =
        (data ?? []) as CategoryRow[];

      return rows
        .filter(
          (row) =>
            typeof row.category ===
              "string" &&
            row.category.trim() !== ""
        )
        .map(
          (row) => ({
            category:
              row.category.trim(),
            count:
              Number(
                row.job_count
              ),
          })
        );
    },
    [
      "horizon-category-counts-v3",
    ],
    {
      revalidate: 300,
    }
  );

export class TaxonomyService {
  static async getCountryCounts() {
    return getCachedCountryCounts();
  }

  static async getCategoryCounts() {
    return getCachedCategoryCounts();
  }
}