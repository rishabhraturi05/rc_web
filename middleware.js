import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("adminToken")?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow login route
  if (pathname.startsWith("/admin/login")) {
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
