import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "./models";


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
          
          console.log(`Sign-in attempt for: ${email} (Google ID: ${googleId})`);
          
          // Check if user email is in initial admin emails list
          const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
          const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''));
          const isInitialAdmin = adminEmails.includes(email || '');
          
          // Check if user exists in database (DB-driven welcome detection)
          const existingUser = await User.findOne({ email });
          let isFirstAppLogin = false;
          
          if (existingUser) {
            // User exists - this is NOT their first login
            isFirstAppLogin = false;
            
            // Update existing user with latest OAuth info
            const userId = existingUser._id || existingUser.id || '';
            if (userId) {
              await User.findByIdAndUpdate(userId, {
                googleId,
                name: user.name || '',
                image: user.image || '',
              });
              console.log(`User signed in: ${email} (Role: ${existingUser.role}, FirstLogin: ${isFirstAppLogin})`);
            }
          } else {
            // Create new user - this IS their first login
            isFirstAppLogin = true;
            
            const newUser = await User.create({
              email: email || '',
              googleId,
              name: user.name || '',
              image: user.image || '',
              role: isInitialAdmin ? 'ADMIN' : 'USER',
            });
            console.log(`New user created: ${email} (Role: ${newUser.role}, FirstLogin: ${isFirstAppLogin})`);
          }
          
          // Store isFirstAppLogin in user object for JWT callback
          user.isFirstAppLogin = isFirstAppLogin;
          
          return true;
        } catch (error: unknown) {
          console.error("Error during sign in:", error);
          const errorCode =
            typeof error === 'object' && error !== null && 'code' in error
              ? String((error as { code?: string }).code)
              : undefined;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("Error code:", errorCode);
          console.error("Error message:", errorMessage);
          
          // Handle duplicate key error - try to clean up and retry
          if (errorCode === '23505') { // PostgreSQL unique violation
            console.log("Duplicate key error, attempting to fix...");
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
              
              console.log("Fixed duplicate key issue and signed in user");
              return true;
            } catch (retryError) {
              console.error("Retry failed:", retryError);
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
            // Preserve the isFirstAppLogin flag from signIn callback
            token.isFirstAppLogin = user.isFirstAppLogin ?? false;
          } else {
            // User might have just been created, set defaults
            token.role = 'USER';
            token.isFirstAppLogin = user.isFirstAppLogin ?? false;
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      } else if (token.id) {
        // On subsequent token refreshes, check if user still exists (DELETED-USER GUARD)
        try {
          const dbUser = await User.findById(token.id as string);
          if (!dbUser) {
            // User has been deleted - invalidate the token
            console.warn(`Session invalidated for deleted user: ${token.id}`);
            return {}; // Return empty token to invalidate session
          }
          // User still exists, update token with current role
          token.role = dbUser.role;
        } catch (error) {
          console.error("Error checking user existence in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.googleId = token.googleId as string;
        session.user.role = token.role as string;
        // Pass isFirstAppLogin flag to session for frontend use
        session.user.isFirstAppLogin = token.isFirstAppLogin ?? false;
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
