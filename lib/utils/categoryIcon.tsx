import type {
  ComponentType,
} from "react";

import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Code2,
  GraduationCap,
  HeartPulse,
  Hotel,
  Landmark,
  Megaphone,
  Network,
  Package,
  Palette,
  PenTool,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

type IconComponent =
  ComponentType<{
    className?: string;
  }>;

const CATEGORY_ICONS: Record<
  string,
  IconComponent
> = {
  "Technology & IT": Code2,
  "Data & Analytics":
    ChartNoAxesCombined,
  Healthcare: HeartPulse,
  "Finance & Accounting":
    CircleDollarSign,
  Administration:
    BriefcaseBusiness,
  "Customer Service":
    Users,
  Sales: ShoppingCart,
  Marketing: Megaphone,
  "Human Resources":
    Users,
  Engineering: Wrench,
  "Logistics & Supply Chain":
    Truck,
  Hospitality: Hotel,

  Education: GraduationCap,
  "Legal & Compliance": Scale,
  Government: Landmark,
  "Security & Cybersecurity":
    ShieldCheck,
  "Software Development":
    Code2,
  "Project Management":
    Settings,
  "Operations & Management":
    Network,
  Design: Palette,
  "Media & Communications":
    PenTool,
  "Real Estate": Building2,
  Manufacturing: Wrench,
  Retail: ShoppingCart,
  "Construction & Trades":
    Wrench,
  "Nonprofit & NGO": Sparkles,
  "Science & Research":
    Activity,
};

function normalize(
  category: string
) {
  return category
    .trim()
    .toLowerCase();
}

export function getCategoryIcon(
  category?: string | null
): IconComponent {
  if (!category) {
    return BriefcaseBusiness;
  }

  const exactEntry =
    Object.entries(
      CATEGORY_ICONS
    ).find(
      ([name]) =>
        normalize(name) ===
        normalize(category)
    );

  if (exactEntry) {
    return exactEntry[1];
  }

  const value =
    normalize(category);

  if (
    value.includes("technology") ||
    value.includes("software") ||
    value.includes("it")
  ) {
    return Code2;
  }

  if (
    value.includes("data") ||
    value.includes("analytics")
  ) {
    return ChartNoAxesCombined;
  }

  if (
    value.includes("health") ||
    value.includes("medical")
  ) {
    return HeartPulse;
  }

  if (
    value.includes("finance") ||
    value.includes("account")
  ) {
    return CircleDollarSign;
  }

  if (
    value.includes("market") ||
    value.includes("sales")
  ) {
    return Megaphone;
  }

  if (
    value.includes("engineer") ||
    value.includes("technical")
  ) {
    return Wrench;
  }

  if (
    value.includes("human") ||
    value.includes("hr") ||
    value.includes("people")
  ) {
    return Users;
  }

  if (
    value.includes("logistics") ||
    value.includes("supply")
  ) {
    return Truck;
  }

  if (
    value.includes("education") ||
    value.includes("teach")
  ) {
    return GraduationCap;
  }

  if (
    value.includes("legal") ||
    value.includes("law")
  ) {
    return Scale;
  }

  if (
    value.includes("design") ||
    value.includes("creative")
  ) {
    return Palette;
  }

  if (
    value.includes("hospitality") ||
    value.includes("hotel") ||
    value.includes("tourism")
  ) {
    return Hotel;
  }

  return BriefcaseBusiness;
}