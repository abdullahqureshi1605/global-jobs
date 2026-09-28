import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(
      body.email ?? ""
    ).trim().toLowerCase();

    const password = String(
      body.password ?? ""
    );

    const companyName = String(
      body.company_name ??
      body.companyName ??
      ""
    ).trim();

    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        {
          error:
            "Name, email, password and company name are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // --------------------------------------------------------
    // HARD DUPLICATE CHECK
    // One email = one Auth account.
    // --------------------------------------------------------

    const {
      data: existingUsers,
      error: existingUsersError,
    } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (existingUsersError) {
      throw new Error(existingUsersError.message);
    }

    const existingUser =
      existingUsers.users.find(
        (user) =>
          String(user.email ?? "")
            .trim()
            .toLowerCase() === email
      );

    if (existingUser) {
      const { data: membership } =
        await admin
          .from("company_members")
          .select("company_id,role")
          .eq("user_id", existingUser.id)
          .limit(1)
          .maybeSingle();

      if (membership) {
        return NextResponse.json(
          {
            error:
              "This email is already registered as a recruiter. Please sign in instead.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "This email is already registered as a user. You cannot create a recruiter account with the same email.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------------
    // CREATE AUTH USER
    // --------------------------------------------------------

    const {
      data: created,
      error: authError,
    } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: "recruiter",
        },
      });

    if (authError || !created.user) {
      return NextResponse.json(
        {
          error:
            authError?.message ||
            "Unable to create recruiter account.",
        },
        { status: 400 }
      );
    }

    const userId = created.user.id;

    // --------------------------------------------------------
    // PROFILE
    // --------------------------------------------------------

    const { error: profileError } =
      await admin
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: name,
            headline: "Recruiter",
            profile_strength: 0,
            is_admin: false,
          },
          {
            onConflict: "id",
          }
        );

    if (profileError) {
      await admin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          error: profileError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------------
    // COMPANY
    // --------------------------------------------------------

    const slugBase =
      companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const slug =
      `${slugBase || "company"}-${userId.slice(0, 8)}`;

    const {
      data: company,
      error: companyError,
    } = await admin
      .from("companies")
      .insert({
        owner_user_id: userId,
        name: companyName,
        slug,
        verification_status: "pending",
      })
      .select("id,name,slug")
      .single();

    if (companyError || !company) {
      await admin
        .from("profiles")
        .delete()
        .eq("id", userId);

      await admin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          error:
            companyError?.message ||
            "Unable to create company.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------------
    // RECRUITER MEMBERSHIP
    // --------------------------------------------------------

    const {
      error: memberError,
    } = await admin
      .from("company_members")
      .insert({
        company_id: company.id,
        user_id: userId,
        role: "admin",
      });

    if (memberError) {
      await admin
        .from("companies")
        .delete()
        .eq("id", company.id);

      await admin
        .from("profiles")
        .delete()
        .eq("id", userId);

      await admin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          error: memberError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email,
          name,
          role: "recruiter",
        },
        company,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "Recruiter signup:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create recruiter account.",
      },
      {
        status: 500,
      }
    );
  }
}
