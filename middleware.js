import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("adminToken")?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow login route through
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Allow /admin (blank dashboard)
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  // If missing token → redirect to login
  if (!token) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Verify JWT
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"], // protect admin pages
};
