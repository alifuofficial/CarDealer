import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Stitch Next.js Proxy Middleware
 * Handles global authentication and role-based access control.
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isSettingsPage = req.nextUrl.pathname.startsWith("/settings");
    const isAdmin = token?.role === "ADMIN";

    // Enforce ADMIN role for settings pages
    if (isSettingsPage && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/proformas/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/cars/:path*",
    "/users/:path*",
    "/api/((?!auth).*)", // Protect all API routes except auth
  ],
};
