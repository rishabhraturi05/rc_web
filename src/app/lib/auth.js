import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/admin";
import bcrypt from "bcryptjs";

// Ensure we have a secret - required for JWT token signing
const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
if (!secret) {
  console.error("ERROR: NEXTAUTH_SECRET or JWT_SECRET must be set in environment variables!");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          const { username, password } = credentials;

          if (!username || !password) {
            return null;
          }

          const adminUser = await Admin.findOne({ username });
          if (!adminUser) {
            return null;
          }

          const isMatch = await bcrypt.compare(password, adminUser.password);
          if (!isMatch) {
            return null;
          }

          return {
            id: adminUser._id.toString(),
            username: adminUser.username,
            role: "admin",
          };
        } catch (error) {
          console.error("AUTH ERROR:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  secret: secret,
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Required for Vercel and other serverless platforms
  // Use environment URL or auto-detect for Vercel
  useSecureCookies: process.env.NODE_ENV === "production",
};

