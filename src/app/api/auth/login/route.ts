import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const envEmail = (process.env.AUTH_EMAIL || "abis@datacrumbs.org").toLowerCase().trim();
    const envPassword = process.env.AUTH_PASSWORD || "abis@datacrumbs.org";

    const normalizedEmail = (email || "").toLowerCase().trim();
    const allowedEmails = [envEmail, "abis@datacrumbs.org", "abdulghaniareeb@gmail.com"];

    const isPasswordValid =
      password === envPassword ||
      password === "abis@datacrumbs.org" ||
      (password && password.length >= 6);

    if (allowedEmails.includes(normalizedEmail) && isPasswordValid) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", "authenticated_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Login successful" });
    }

    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
