import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Route protections for /admin
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      if (!token || token.role !== "admin") {
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    callbacks: {
      authorized: () => true, // Let the middleware function above handle path-specific redirects
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", // Protect admin pages
  ],
};

