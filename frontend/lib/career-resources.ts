import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CareerResource = {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

export async function getPublishedCareerResources(): Promise<CareerResource[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("career_resources")
    .select("id,title,slug,body,category,published_at,created_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load career resources: ${error.message}`
    );
  }

  return (data ?? []) as CareerResource[];
}

export async function getCareerResourceBySlug(
  slug: string
): Promise<CareerResource | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("career_resources")
    .select("id,title,slug,body,category,published_at,created_at")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load career resource: ${error.message}`
    );
  }

  return data as CareerResource | null;
}