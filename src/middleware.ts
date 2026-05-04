import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isSettingsPage = req.nextUrl.pathname.startsWith("/settings");
    const isAdmin = token?.role === "ADMIN";

    if (isSettingsPage && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
    "/api/((?!auth).*)", // Protect all API routes except auth
  ],
};
