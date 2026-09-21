import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const {
      data: users,
      error: usersError,
    } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      throw new Error(usersError.message);
    }

    const existingUser = users.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (existingUser) {
      const { data: membership } = await supabase
        .from("company_members")
        .select("id,role")
        .eq("user_id", existingUser.id)
        .in("role", ["admin", "recruiter"])
        .limit(1)
        .maybeSingle();

      if (membership) {
        return NextResponse.json(
          {
            error:
              "This email is already registered as a recruiter. Recruiter accounts cannot also be candidate accounts. Please use another email.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        account_type: "candidate",
      },
    });

    if (authError || !authData.user) {
      throw new Error(
        authError?.message ||
          "Unable to create authentication account."
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: name,
      })
      .select("id,full_name")
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(
        authData.user.id
      );

      throw new Error(profileError.message);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email,
          full_name: profile.full_name,
          role: "candidate",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Candidate signup:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create account.",
      },
      { status: 500 }
    );
  }
}
