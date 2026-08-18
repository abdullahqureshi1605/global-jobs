import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Delete all cookies
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      cookieStore.delete(cookie.name);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}