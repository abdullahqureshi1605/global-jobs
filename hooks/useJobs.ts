"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/lib/api";


export function useJobs(
  params: Record<
    string,
    string | number | undefined
  > = {},
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await getJobs(params);

        if (active) {
          setData(result?.data || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load jobs",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [
    params.search,
    params.country_id,
    params.category_id,
    params.work_mode,
    params.employment_type,
    params.page,
    params.limit,
  ]);

  return {
    data,
    loading,
    error,
  };
}
