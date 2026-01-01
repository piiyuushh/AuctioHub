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
          
          const email = user.email?.toLowerCase();
          const googleId = account.providerAccountId;
          
          console.log(`🔐 Sign-in attempt for: ${email} (Google ID: ${googleId})`);
          
          // Check if user email is in initial admin emails list
          const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
          const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''));
          const isInitialAdmin = adminEmails.includes(email || '');
          
          // Use findOneAndUpdate with upsert for atomic operation
          // This handles both new users and existing users in one operation
          const updatedUser = await User.findOneAndUpdate(
            { email }, // Find by email (primary identifier)
            {
              $set: {
                googleId,
                name: user.name || '',
                image: user.image || '',
              },
              $setOnInsert: {
                email,
                role: isInitialAdmin ? 'ADMIN' : 'USER',
              }
            },
            { 
              upsert: true, // Create if doesn't exist
              new: true,    // Return the updated document
              runValidators: true 
            }
          );
          
          if (updatedUser) {
            console.log(`✅ User signed in: ${email} (Role: ${updatedUser.role})`);
          }
          
          return true;
        } catch (error: any) {
          console.error("❌ Error during sign in:", error);
          console.error("❌ Error code:", error.code);
          console.error("❌ Error message:", error.message);
          
          // Handle duplicate key error - try to clean up and retry
          if (error.code === 11000) {
            console.log("🔄 Duplicate key error, attempting to fix...");
            try {
              // If there's a duplicate googleId, update the existing record
              const email = user.email?.toLowerCase();
              const googleId = account.providerAccountId;
              
              // First, remove googleId from any other user that might have it
              await User.updateMany(
                { googleId, email: { $ne: email } },
                { $unset: { googleId: 1 } }
              );
              
              // Now try to update/create again
              await User.findOneAndUpdate(
                { email },
                {
                  $set: {
                    googleId,
                    name: user.name || '',
                    image: user.image || '',
                  }
                },
                { upsert: true, new: true }
              );
              
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
          await connectToDatabase();
          const email = user.email?.toLowerCase();
          const dbUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
          });
          
          if (dbUser) {
            token.id = dbUser._id.toString();
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
