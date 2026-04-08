import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId: string;
      role: string;
      isFirstAppLogin?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    googleId?: string;
    role?: string;
    isFirstAppLogin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    googleId?: string;
    role?: string;
    isFirstAppLogin?: boolean;
  }
}
