import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/admin";
import AddSec from "@/app/models/AddSec";
import { DEFAULT_ADDSECS, ensureDefaultAddSecs } from "@/app/lib/seedAddSecs";
import bcrypt from "bcryptjs";

// Force localhost in development so cookies and CSRF are not rejected by modern browsers
if (process.env.NODE_ENV === "development") {
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("rc-nitw.org")) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
}

// Ensure we have a secret - required for JWT token signing
const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
if (!secret) {
  console.error("ERROR: NEXTAUTH_SECRET or JWT_SECRET must be set in environment variables!");
}

const isLocalhost =
  process.env.NODE_ENV === "development" ||
  process.env.NEXTAUTH_URL?.includes("localhost") ||
  process.env.NEXTAUTH_URL?.includes("127.0.0.1");

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

          console.log("\n=================== [AUTH ATTEMPT] ===================");
          console.log(`[AUTH] Time: ${new Date().toISOString()}`);
          console.log(`[AUTH] Input username: "${username}"`);
          console.log(`[AUTH] Input password length: ${password ? password.length : 0}`);

          if (!username || !password) {
            console.log("[AUTH] Error: Missing username or password.");
            return null;
          }

          const cleanUsername = String(username).trim();

          // 1. Check Admin collection
          let adminUser = await Admin.findOne({
            $or: [
              { username: cleanUsername },
              { username: cleanUsername.toLowerCase() },
              { username: { $regex: new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
            ],
          });

          // If no admin exists in DB at all, auto-create the default one
          if (!adminUser) {
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
              console.log("[AUTH] Zero admins found in DB! Creating default admin roboticsclub@nitw.ac.in...");
              const hashedPassword = await bcrypt.hash("roboticsclub@2027", 10);
              adminUser = await Admin.create({
                username: "roboticsclub@nitw.ac.in",
                password: hashedPassword,
              });
              console.log("[AUTH] Default admin created successfully.");
            }
          }

          if (adminUser) {
            console.log(`[AUTH] Found Admin record for: "${adminUser.username}"`);
            const isMatch = await bcrypt.compare(password, adminUser.password);

            if (isMatch) {
              console.log(`[AUTH] Admin login SUCCESS for ${adminUser.username}`);
              return {
                id: adminUser._id.toString(),
                name: adminUser.username,
                email: adminUser.username,
                username: adminUser.username,
                role: "admin",
              };
            } else {
              console.log(`[AUTH] Admin password comparison failed for ${adminUser.username}`);
            }
          }

          // 2. Check AddSec collection
          const normalizedDeptName = cleanUsername.toLowerCase().replace(/^addsec_/, "");
          let addSecUser = await AddSec.findOne({
            $or: [
              { username: cleanUsername.toLowerCase() },
              { username: `addsec_${normalizedDeptName}` },
              { department: { $regex: new RegExp(`^${normalizedDeptName}$`, "i") } },
            ],
          });

          const defaultAddSec = DEFAULT_ADDSECS.find(
            (item) =>
              item.username.toLowerCase() === cleanUsername.toLowerCase() ||
              item.username.toLowerCase() === `addsec_${normalizedDeptName}` ||
              item.department.toLowerCase() === normalizedDeptName
          );

          if (!addSecUser && defaultAddSec) {
            console.log(`[AUTH] Auto-creating AddSec account for ${defaultAddSec.username}...`);
            const hashedPassword = await bcrypt.hash(defaultAddSec.password, 10);
            addSecUser = await AddSec.create({
              username: defaultAddSec.username,
              password: hashedPassword,
              department: defaultAddSec.department,
            });
            console.log(`[AUTH] Created AddSec account ${defaultAddSec.username} (${defaultAddSec.department})`);
          }

          if (addSecUser) {
            console.log(`[AUTH] Found AddSec record for: "${addSecUser.username}" (${addSecUser.department})`);
            const cleanPass = String(password).trim();
            let isMatch = await bcrypt.compare(cleanPass, addSecUser.password);

            // Also check un-trimmed password in case original had intentional spaces
            if (!isMatch && cleanPass !== password) {
              isMatch = await bcrypt.compare(password, addSecUser.password);
            }

            if (isMatch) {
              console.log(`[AUTH] AddSec login SUCCESS for ${addSecUser.username} (${addSecUser.department})`);
              return {
                id: addSecUser._id.toString(),
                name: addSecUser.username,
                email: `${addSecUser.username}@rc-nitw.org`,
                username: addSecUser.username,
                department: addSecUser.department,
                role: "addsec",
              };
            } else {
              console.log(`[AUTH] AddSec password comparison failed for ${addSecUser.username}`);
            }
          }

          console.log("[AUTH] No matching credentials found.");
          return null;
        } catch (error) {
          console.error("[AUTH] UNCAUGHT ERROR:", error);
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
        token.department = user.department || null;
      }

      // Fallback: If department is missing on an addsec token, look it up in DB
      if (token?.role === "addsec" && !token.department && token.username) {
        try {
          await connectDB();
          const addSec = await AddSec.findOne({ username: token.username.toLowerCase() });
          if (addSec) {
            token.department = addSec.department;
          }
        } catch (e) {
          console.error("Error looking up addsec department:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session && token) {
        session.user = {
          ...(session.user || {}),
          id: token.id,
          username: token.username,
          role: token.role,
          department: token.department || null,
        };
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
  trustHost: true,
  useSecureCookies: !isLocalhost,
  cookies: isLocalhost
    ? {
        sessionToken: {
          name: "next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false,
          },
        },
      }
    : undefined,
};

