import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("adminToken")?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // If on login page and has valid token, redirect to responses
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        // Valid token, redirect to responses
        const redirectUrl = new URL("/admin/responses", req.url);
        return NextResponse.redirect(redirectUrl);
      } catch (err) {
        // Invalid token, allow login page
        return NextResponse.next();
      }
    }
    // No token, allow login page
    return NextResponse.next();
  }

  // Allow public admin root
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  // If no token, redirect
  if (!token) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],  // Protect ALL admin pages
};
