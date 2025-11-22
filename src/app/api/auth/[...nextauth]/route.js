import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Validate secret exists before initializing
if (!authOptions.secret) {
  throw new Error(
    "Missing NEXTAUTH_SECRET or JWT_SECRET environment variable. " +
    "Please set one of these in your Vercel environment variables."
  );
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

