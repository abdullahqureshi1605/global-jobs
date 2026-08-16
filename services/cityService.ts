import { unstable_cache } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface CityCount {
  city: string;
  count: number;
}

const getCachedCityCounts =
  (country: string) =>
    unstable_cache(
      async (): Promise<CityCount[]> => {
        const {
          data,
          error,
        } = await supabaseAdmin
          .from("jobs")
          .select("city")
          .eq(
            "status",
            "published"
          )
          .ilike(
            "country",
            country
          )
          .not(
            "city",
            "is",
            null
          );

        if (error) {
          throw new Error(
            `Failed to load city counts: ${error.message}`
          );
        }

        const counts =
          new Map<
            string,
            number
          >();

        for (const row of
          data ?? []) {
          if (
            typeof row.city !==
              "string" ||
            row.city.trim() === ""
          ) {
            continue;
          }

          const city =
            row.city.trim();

          counts.set(
            city,
            (
              counts.get(city) ??
              0
            ) + 1
          );
        }

        return Array.from(
          counts.entries()
        )
          .map(
            ([
              city,
              count,
            ]) => ({
              city,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          );
      },
      [
        "horizon-city-counts",
        country.toLowerCase(),
      ],
      {
        revalidate: 300,
      }
    )();

export class CityService {
  static async getCityCounts(
    country: string
  ): Promise<CityCount[]> {
    return getCachedCityCounts(
      country
    );
  }
}