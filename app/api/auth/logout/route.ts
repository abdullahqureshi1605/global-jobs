import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete ALL cookies
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      cookieStore.delete(cookie.name);
    }

    // Also delete specific known cookies
    const specificCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "auth_token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "next-auth.state",
    ];

    for (const name of specificCookies) {
      cookieStore.delete(name);
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}