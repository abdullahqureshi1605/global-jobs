import { NextResponse } from "next/server";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = clean(body?.email).toLowerCase();
    const password = typeof body?.password === "string"
      ? body.password
      : "";

    const adminEmail = clean(process.env.ADMIN_EMAIL).toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";

    console.log("ADMIN LOGIN CHECK:", {
      emailReceived: email,
      emailExpected: adminEmail,
      passwordLengthReceived: password.length,
      passwordLengthExpected: adminPassword.length,
    });

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Admin authentication is not configured." },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid administrator email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      role: "admin",
    });

    response.cookies.set("horizon_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Unable to authenticate administrator." },
      { status: 500 }
    );
  }
}
