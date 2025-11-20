// middleware.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
    const token = req.cookies.get("adminToken")?.value;

    // If there is no token, redirect to the login page.
    // The matcher ensures this only runs for /admin/dashboard and other protected routes.
    if (!token) {
        // Assuming your admin login page is at /admin
        return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        // Token is valid, continue to the requested page
        return NextResponse.next();
    } catch (err) {
        // Token is invalid/expired, redirect to the login page
        return NextResponse.redirect(new URL("/admin", req.url));
    }
}

export const config = {
    matcher: [
      "/admin/:path*" // This includes the base /admin route itself
    ]
};