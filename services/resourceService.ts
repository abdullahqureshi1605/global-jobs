import { supabaseAdmin } from "@/lib/supabase/admin";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  author: string;
  authorRole?: string;
  readTime: string;
  publishedDate: string;
  updatedDate?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
}

function mapResource(row: any): Resource {
  return {
    id: row.id ?? "",

    slug: row.slug ?? "",

    title: row.title ?? "",

    category: row.category ?? "",

    description: row.description ?? "",

    content: row.content ?? "",

    author:
      row.author ??
      "Horizon Jobs",

    authorRole:
      row.author_role ??
      row.authorRole ??
      "",

    readTime:
      row.read_time ??
      row.readTime ??
      "",

    publishedDate:
      row.published_date ??
      row.publishedDate ??
      "",

    updatedDate:
      row.updated_date ??
      row.updatedDate ??
      undefined,

    featured:
      Boolean(row.featured),

    seoTitle:
      row.seo_title ??
      row.seoTitle ??
      "",

    seoDescription:
      row.seo_description ??
      row.seoDescription ??
      "",

    status:
      row.status ??
      "draft",
  };
}

export class ResourceService {
  static async getPublishedResources(): Promise<Resource[]> {
    const { data, error } =
      await supabaseAdmin
        .from("resources")
        .select("*")
        .eq("status", "published")
        .order("published_date", {
          ascending: false,
        });

    if (error) {
      throw new Error(
        `Failed to load published resources: ${error.message}`
      );
    }

    return (data ?? []).map(mapResource);
  }

  static async getResourceBySlug(
    slug: string
  ): Promise<Resource | null> {
    const { data, error } =
      await supabaseAdmin
        .from("resources")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load resource: ${error.message}`
      );
    }

    return data
      ? mapResource(data)
      : null;
  }
}