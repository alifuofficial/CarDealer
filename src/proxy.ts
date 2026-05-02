import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cars/:path*",
    "/customers/:path*",
    "/users/:path*",
  ],
};
