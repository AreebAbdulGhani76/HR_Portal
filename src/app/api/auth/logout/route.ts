import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return NextResponse.redirect(new URL("/login", request.url));
}
