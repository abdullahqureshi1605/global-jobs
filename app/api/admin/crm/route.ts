import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TABLES = {
  leads: "crm_leads",
  companies: "crm_companies",
  contacts: "crm_contacts",
  deals: "crm_deals",
  tasks: "crm_tasks",
  activities: "crm_activities",
  content: "crm_content",
  targets: "crm_job_targets",
} as const;

type ModuleName = keyof typeof TABLES;

function isModule(value: string): value is ModuleName {
  return value in TABLES;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const module = searchParams.get("module") ?? "leads";

  if (!isModule(module)) {
    return NextResponse.json(
      { error: "Invalid CRM module." },
      { status: 400 }
    );
  }

  const table = TABLES[module];

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to load CRM data.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data ?? [],
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const module = body.module as string;
  const payload = body.data;

  if (!isModule(module) || !payload) {
    return NextResponse.json(
      { error: "Invalid CRM request." },
      { status: 400 }
    );
  }

  const table = TABLES[module];

  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to create CRM record.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  );
}