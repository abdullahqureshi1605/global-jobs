import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .limit(1);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase Connection Test
      </h1>

      <pre className="mt-5 whitespace-pre-wrap">
        {JSON.stringify(
          {
            connected: !error,
            data,
            error: error?.message ?? null,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}