import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { pool } from "./database";
import { User } from "./models";

// Log configuration status on startup
console.log("🔐 NextAuth Configuration Status:");
console.log("  - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("  - GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("  - NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing");
console.log("  - NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "Not set (will use default)");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.toLowerCase();
          const googleId = account.providerAccountId;
          
          console.log(`🔐 Sign-in attempt for: ${email} (Google ID: ${googleId})`);
          
          // Check if user email is in initial admin emails list
          const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
          const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''));
          const isInitialAdmin = adminEmails.includes(email || '');
          
          // Check if user exists
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // Update existing user
            const userId = existingUser._id || existingUser.id || '';
            if (userId) {
              await User.findByIdAndUpdate(userId, {
                googleId,
                name: user.name || '',
                image: user.image || '',
              });
              console.log(`✅ User signed in: ${email} (Role: ${existingUser.role})`);
            }
          } else {
            // Create new user
            const newUser = await User.create({
              email: email || '',
              googleId,
              name: user.name || '',
              image: user.image || '',
              role: isInitialAdmin ? 'ADMIN' : 'USER',
            });
            console.log(`✅ New user created: ${email} (Role: ${newUser.role})`);
          }
          
          return true;
        } catch (error: any) {
          console.error("❌ Error during sign in:", error);
          console.error("❌ Error code:", error.code);
          console.error("❌ Error message:", error.message);
          
          // Handle duplicate key error - try to clean up and retry
          if (error.code === '23505') { // PostgreSQL unique violation
            console.log("🔄 Duplicate key error, attempting to fix...");
            try {
              // If there's a duplicate googleId, update the existing record
              const email = user.email?.toLowerCase();
              const googleId = account.providerAccountId;
              
              // Find user by email and update
              const existingUser = await User.findOne({ email });
              if (existingUser) {
                const userId = existingUser._id || existingUser.id || '';
                if (userId) {
                  await User.findByIdAndUpdate(userId, {
                    googleId,
                    name: user.name || '',
                    image: user.image || '',
                  });
                }
              }
              
              console.log("✅ Fixed duplicate key issue and signed in user");
              return true;
            } catch (retryError) {
              console.error("❌ Retry failed:", retryError);
            }
          }
          
          // Still allow sign-in to prevent lockout
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const email = user.email?.toLowerCase();
          const dbUser = await User.findOne({ email });
          
          if (dbUser) {
            token.id = (dbUser._id || dbUser.id || '').toString();
            token.googleId = dbUser.googleId;
            token.role = dbUser.role;
          } else {
            // User might have just been created, set defaults
            token.role = 'USER';
          }
        } catch (error) {
          console.error("❌ Error fetching user in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.googleId = token.googleId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
