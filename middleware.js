// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req) {
//   const token = req.cookies.get("adminToken")?.value;
//   const url = req.nextUrl.clone();
//   const pathname = url.pathname;

//   // Allow login route
//   if (pathname.startsWith("/admin/login")) {
//     return NextResponse.next();
//   }

//   // Allow public admin root
//   if (pathname === "/admin") {
//     return NextResponse.next();
//   }

//   // If no token, redirect
//   if (!token) {
//     url.pathname = "/admin/login";
//     return NextResponse.redirect(url);
//   }

//   // Verify token
//   try {
//     jwt.verify(token, process.env.JWT_SECRET);
//     return NextResponse.next();
//   } catch (err) {
//     url.pathname = "/admin/login";
//     return NextResponse.redirect(url);
//   }
// }

// export const config = {
//   matcher: ["/admin/:path*"],  // Protect ALL admin pages
// };
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
    const token = req.cookies.get("adminToken")?.value;
    const url = req.nextUrl.clone();
    const pathname = url.pathname;

    // --- DEBUGGING LOG ---
    console.log(`[Middleware Check] Path: ${pathname}`);
    if (!token) {
        console.log("[Middleware Check] Token Status: NOT FOUND. Redirecting to login.");
    } else {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            console.log("[Middleware Check] Token Status: VALID. Allowing access.");
        } catch (err) {
            console.log("[Middleware Check] Token Status: INVALID/EXPIRED. Redirecting to login.");
        }
    }
    // ---------------------


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
    matcher: ["/admin/:path*"],
};