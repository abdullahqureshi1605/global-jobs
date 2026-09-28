import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const company =
      typeof body.company_name === "string"
        ? body.company_name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      name.length < 2 ||
      company.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 6
    ) {
      return NextResponse.json(
        {
          error:
            "Enter valid name, company, email and a password of at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .insert({
          full_name: name,
          email,
          password_hash: passwordHash,
          role: "employer",
        })
        .select("id")
        .single();

    if (profileError || !profile) {
      throw new Error(
        profileError?.message ||
          "Recruiter profile could not be created."
      );
    }

    const slug =
      company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 7);

    const { data: companyRow, error: companyError } =
      await supabase
        .from("companies")
        .insert({
          name: company,
          slug,
          owner_user_id: profile.id,
        })
        .select("id")
        .single();

    if (companyError || !companyRow) {
      await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      throw new Error(
        companyError?.message ||
          "Company could not be created."
      );
    }

    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        company_id: companyRow.id,
        user_id: profile.id,

        // Database constraint allows only:
        // admin | recruiter
        role: "recruiter",
      });

    if (memberError) {
      await supabase
        .from("companies")
        .delete()
        .eq("id", companyRow.id);

      await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      throw new Error(memberError.message);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: profile.id,
          name,
          email,
          company_id: companyRow.id,
          company_name: company,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Recruiter signup:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create recruiter account.",
      },
      { status: 500 }
    );
  }
}