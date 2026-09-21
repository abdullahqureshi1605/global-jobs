import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";import { getSupabaseAdmin } from "@/lib/supabase/admin";export async function GET(){const {data,error}=await getSupabaseAdmin().from("countries").select("id,name,code").order("name");if(error)return NextResponse.json({error:error.message,data:[]},{status:500});return NextResponse.json({data:data??[]})}
