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

interface Context {
  params: Promise<{
    module: string;
    id: string;
  }>;
}

export async function PUT(
  request: Request,
  context: Context
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { module, id } = await context.params;

  if (!isModule(module) || !id) {
    return NextResponse.json(
      { error: "Invalid CRM record." },
      { status: 400 }
    );
  }

  const payload = await request.json();

  const { data, error } = await supabaseAdmin
    .from(TABLES[module])
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to update CRM record.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function DELETE(
  _request: Request,
  context: Context
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { module, id } = await context.params;

  if (!isModule(module) || !id) {
    return NextResponse.json(
      { error: "Invalid CRM record." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from(TABLES[module])
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to delete CRM record.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}