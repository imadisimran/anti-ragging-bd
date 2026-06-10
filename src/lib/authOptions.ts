import { getUserInfo, loginUser, saveSocialUser } from "@/actions/server/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decryptData } from "./encryption";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const result = await loginUser({ email: credentials?.email, password: credentials?.password });
        if (result.success && result.user) {
          const isStudent = result.user.role === "student" || !result.user.role;
          const user = {
            id: result.user.userId,
            name: isStudent ? decryptData(result.user.name) : result.user.name,
            email: isStudent ? decryptData(result.user.email) : result.user.email,
            userId: result.user.userId,
            role: result.user.role,
            isVerified: result?.user?.isVerified ?? false,
            isProfileComplete: result?.user?.isProfileComplete,
          };
          return user;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google") {
        if (!profile?.email_verified) {
          // console.log(profile?.email_verified);
          return false;
        }
      }
      return true;
    },
    async session({ session, user, token }) {
      session.user.userId = token?.userId;
      session.user.role = token?.role;
      session.user.isVerified = token?.isVerified;
      session.user.isProfileComplete = token?.isProfileComplete;
      if (token?.name) {
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser, trigger }) {
      // console.log({account,token,user,profile,isNewUser})
      if (account?.provider === "google") {
        const data = {
          name: user?.name || "",
          email: user?.email || "",
          provider: account?.provider,
          isVerified: profile?.email_verified || false,
        };
        const result = await saveSocialUser(data);
        if (result.success && result.user) {
          token.userId = result.user.userId;
          token.role = result.user.role;
          token.isVerified = result.user.isVerified;
          token.isProfileComplete = result.user.isProfileComplete;
        }
      } else if (account?.provider === "credentials") {
        token.userId = user?.userId;
        token.role = user?.role;
        token.isVerified = user?.isVerified;
        token.isProfileComplete = user?.isProfileComplete;
      }
      if (trigger === "update") {
        // console.log("update triggered")
        const userInfo = await getUserInfo(token?.email || "");
        // console.log("UserInfo Log:", { email: token.email, userInfo })
        if (userInfo.success && userInfo.user) {
          token.role = userInfo?.user?.role;
          token.isVerified = userInfo?.user?.isVerified;
          token.name = userInfo?.user?.name || token.name;
          token.isProfileComplete = userInfo?.user?.isProfileComplete;
        }
      }
      return token;
    },
  },
};
