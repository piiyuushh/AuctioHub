import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "./mongodb";
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
          await connectToDatabase();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with default role "USER"
            // Check if user email is in initial admin emails list
            const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            const adminEmails = adminEmailsRaw.map(email => email.replace(/^["']|["']$/g, ''));
            const isInitialAdmin = adminEmails.includes(user.email || '');
            
            await User.create({
              googleId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
              role: isInitialAdmin ? 'ADMIN' : 'USER',
            });
            
            console.log(`✅ New user created: ${user.email} with role: ${isInitialAdmin ? 'ADMIN' : 'USER'}`);
          } else if (!existingUser.googleId) {
            // Update existing user with googleId if they don't have one
            existingUser.googleId = account.providerAccountId;
            existingUser.name = user.name;
            existingUser.image = user.image;
            await existingUser.save();
            console.log(`✅ Updated existing user: ${user.email} with Google ID`);
          }
          
          return true;
        } catch (error) {
          console.error("❌ Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.googleId = dbUser.googleId;
            token.role = dbUser.role;
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
