import { unstable_cache } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";

type CountryCount = [
  string,
  number
];

type CategoryCount = [
  string,
  number
];

interface CountryRow {
  country: string;
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
      } =
        await supabaseAdmin.rpc(
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
          (
            row
          ): row is CountryRow =>
            typeof row.country ===
              "string" &&
            row.country.trim() !==
              ""
        )
        .map(
          (row) =>
            [
              row.country.trim(),
              Number(
                row.job_count
              ),
            ] as CountryCount
        );
    },
    [
      "horizon-country-counts-v2",
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
      } =
        await supabaseAdmin.rpc(
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
          (
            row
          ): row is CategoryRow =>
            typeof row.category ===
              "string" &&
            row.category.trim() !==
              ""
        )
        .map(
          (row) =>
            [
              row.category.trim(),
              Number(
                row.job_count
              ),
            ] as CategoryCount
        );
    },
    [
      "horizon-category-counts-v2",
    ],
    {
      revalidate: 300,
    }
  );

export class TaxonomyService {
  static async getCountryCounts(): Promise<
    Map<string, number>
  > {
    const rows =
      await getCachedCountryCounts();

    return new Map<
      string,
      number
    >(rows);
  }

  static async getCategoryCounts(): Promise<
    Map<string, number>
  > {
    const rows =
      await getCachedCategoryCounts();

    return new Map<
      string,
      number
    >(rows);
  }
}