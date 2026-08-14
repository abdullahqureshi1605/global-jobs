export interface CareerResource {
  id: string;
  slug: string;
  title: string;
  category: string;

  description: string;
  content: string;

  author: string;
  authorRole?: string;

  publishedDate: string;
  updatedDate?: string;

  readTime: string;

  featured: boolean;
  status: "draft" | "published" | "archived";

  seoTitle?: string;
  seoDescription?: string;
}