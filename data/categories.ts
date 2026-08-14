import { Category } from "@/types/job";
import {
  Briefcase,
  Layers,
  DollarSign,
  FileText,
  Sparkles,
  TrendingUp,
  UserCheck,
  Building,
  Sliders,
  BookOpen,
  Navigation,
} from "lucide-react";

export const categories: Category[] = [
  {
    name: "Technology & IT",
    slug: "technology-it",
    description:
      "Software development, cloud systems, cybersecurity, DevOps and IT infrastructure.",
    icon: Briefcase,
    jobCount: 2450,
  },
  {
    name: "Data & Analytics",
    slug: "data-analytics",
    description:
      "Data science, analytics engineering, business intelligence and machine learning.",
    icon: Layers,
    jobCount: 1180,
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description:
      "Clinical operations, healthcare administration, pharmaceuticals and medical careers.",
    icon: UserCheck,
    jobCount: 940,
  },
  {
    name: "Finance & Accounting",
    slug: "finance-accounting",
    description:
      "Accounting, banking, financial analysis, auditing and risk management.",
    icon: DollarSign,
    jobCount: 1320,
  },
  {
    name: "Administration",
    slug: "administration",
    description:
      "Executive assistance, office administration, operations and administrative support.",
    icon: FileText,
    jobCount: 860,
  },
  {
    name: "Customer Service",
    slug: "customer-service",
    description:
      "Customer support, client success, contact center and service operations.",
    icon: UserCheck,
    jobCount: 720,
  },
  {
    name: "Sales",
    slug: "sales",
    description:
      "Enterprise sales, account management and business development opportunities.",
    icon: TrendingUp,
    jobCount: 1050,
  },
  {
    name: "Marketing",
    slug: "marketing",
    description:
      "Digital marketing, SEO, content strategy, product marketing and growth.",
    icon: Sparkles,
    jobCount: 910,
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    description:
      "Human resources, talent acquisition, HR business partnering and people operations.",
    icon: Building,
    jobCount: 640,
  },
  {
    name: "Engineering",
    slug: "engineering",
    description:
      "Civil, mechanical, electrical, structural and other engineering careers.",
    icon: Sliders,
    jobCount: 1210,
  },
  {
    name: "Logistics & Supply Chain",
    slug: "logistics-supply-chain",
    description:
      "Logistics, freight forwarding, supply chain, warehouse and transport operations.",
    icon: Navigation,
    jobCount: 830,
  },
  {
    name: "Hospitality",
    slug: "hospitality",
    description:
      "Hotels, tourism, guest services, food service and hospitality management.",
    icon: BookOpen,
    jobCount: 520,
  },
];