import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isValidSession = await verifySessionToken(authToken);

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin routes against unauthenticated PII leakage
  if (pathname.startsWith("/api/admin")) {
    if (!isValidSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required" },
        { status: 401 },
      );
    }
  }

  // If already logged in, redirect away from /login to dashboard
  if (pathname === "/login" && isValidSession) {
    const dashboardUrl = new URL("/dashboard/hr", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*", "/login"],
};
