import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { dashboardForRole } from "./lib/rbac";

/** Routes that require authentication */
const PROTECTED = ["/student", "/staff", "/admin", "/tickets"];
/** Routes only for guests (redirect logged-in users away) */
const GUEST_ONLY = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  // Not logged in trying to access a protected page -> redirect to login with no-store
  if (isProtected && !session) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    return res;
  }

  // Logged in trying to access login/register -> redirect to dashboard
  if (isGuestOnly && session) {
    return NextResponse.redirect(
      new URL(dashboardForRole(session.role), req.url),
    );
  }

  if (
    session &&
    ["/student", "/staff", "/admin"].some((route) => pathname.startsWith(route))
  ) {
    const expectedRoute = dashboardForRole(session.role);
    const isOwnRoleRoute = pathname.startsWith(expectedRoute);
    if (!isOwnRoleRoute) {
      return NextResponse.redirect(new URL(expectedRoute, req.url));
    }
  }

  // Set no-cache on protected routes so browser back button never shows cached authenticated data
  const res = NextResponse.next();
  if (isProtected) {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
  }
  return res;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/staff/:path*",
    "/admin/:path*",
    "/tickets/:path*",
    "/login",
    "/register",
  ],
};
