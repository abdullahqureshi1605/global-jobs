import { createClient } from "@/lib/supabase/server";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  updatedDate: string;
  readTime: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
}

function mapResource(row: any): Resource {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    content: row.content,
    author: row.author,
    authorRole: row.author_role || "",
    publishedDate: row.published_date,
    updatedDate: row.updated_date || "",
    readTime: row.read_time,
    featured: row.featured ?? false,
    status: row.status,
    seoTitle: row.seo_title || row.title,
    seoDescription:
      row.seo_description || row.description,
  };
}

export class ResourceService {
  static async getPublishedResources(): Promise<Resource[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "published")
      .order("published_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to fetch resources:",
        error
      );

      return [];
    }

    return (data || []).map(mapResource);
  }

  static async getFeaturedResources(): Promise<Resource[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("published_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to fetch featured resources:",
        error
      );

      return [];
    }

    return (data || []).map(mapResource);
  }

  static async getResourceBySlug(
    slug: string
  ): Promise<Resource | undefined> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to fetch resource:",
        error
      );

      return undefined;
    }

    return data ? mapResource(data) : undefined;
  }
}