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

    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
    
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

// Also handle GET requests (just in case)
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}