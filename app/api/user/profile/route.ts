import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const PROFILE_FIELDS = [
  "full_name",
  "headline",
  "country_id",
  "city",
  "phone",
  "resume_url",
  "skills",
  "bio",
  "open_to",
] as const;

function calculateProfileStrength(profile: Record<string, any>) {
  const checks = [
    Boolean(profile.full_name?.trim()),
    Boolean(profile.headline?.trim()),
    Boolean(profile.country_id),
    Boolean(profile.city?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.resume_url?.trim()),
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Boolean(profile.bio?.trim()),
    Boolean(profile.open_to),
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select(
        "id,full_name,headline,country_id,city,phone,resume_url,skills,bio,open_to,profile_strength,created_at,updated_at"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const profile = data ?? {
      id: user.id,
      full_name: user.name ?? "",
      headline: "",
      country_id: null,
      city: "",
      phone: "",
      resume_url: "",
      skills: [],
      bio: "",
      open_to: null,
      profile_strength: 0,
    };

    return NextResponse.json({
      success: true,
      profile,
      email: user.email ?? "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, any> = {};

    for (const field of PROFILE_FIELDS) {
      if (!(field in body)) {
        continue;
      }

      const value = body[field];

      if (field === "skills") {
        if (Array.isArray(value)) {
          updateData.skills = value
            .filter(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0
            )
            .map((item) => item.trim());
        } else if (typeof value === "string") {
          updateData.skills = value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        continue;
      }

      if (field === "open_to") {
        if (
          value === null ||
          value === undefined ||
          (typeof value === "string" &&
            value.trim() === "")
        ) {
          updateData.open_to = null;
        } else if (typeof value === "string") {
          updateData.open_to = value.trim();
        }

        continue;
      }

      if (value === null || value === undefined) {
        updateData[field] = null;
      } else if (typeof value === "string") {
        updateData[field] = value.trim();
      } else {
        updateData[field] = value;
      }
    }

    if (
      "full_name" in updateData &&
      !String(updateData.full_name ?? "").trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    const existingResult = await getSupabaseAdmin()
      .from("profiles")
      .select(
        "id,full_name,headline,country_id,city,phone,resume_url,skills,bio,open_to,profile_strength"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (existingResult.error) {
      throw new Error(existingResult.error.message);
    }

    const merged = {
      ...(existingResult.data ?? {}),
      ...updateData,
    };

    const strength = calculateProfileStrength(merged);

    updateData.profile_strength = strength;

    let { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select(
        "id,full_name,headline,country_id,city,phone,resume_url,skills,bio,open_to,profile_strength,created_at,updated_at"
      )
      .single();

    if (
      error &&
      String(error.code) === "23514" &&
      "open_to" in updateData
    ) {
      delete updateData.open_to;

      const retry = await getSupabaseAdmin()
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select(
          "id,full_name,headline,country_id,city,phone,resume_url,skills,bio,open_to,profile_strength,created_at,updated_at"
        )
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      profile: data,
      email: user.email ?? "",
    });
  } catch (error) {
    console.error("Profile update:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}
