import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "recruiter_token";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Recruiter logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}