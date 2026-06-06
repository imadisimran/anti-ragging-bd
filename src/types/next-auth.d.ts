import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId?: string;
      role?: string;
      isVerified?: boolean;
      isProfileComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    userId?: string;
    role?: string;
    isVerified?: boolean;
    isProfileComplete?: boolean;
  }

  interface Profile {
    email_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    isVerified?: boolean;
    isProfileComplete?: boolean;
  }
}
