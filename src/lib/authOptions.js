import { getUserInfo, loginUser, saveSocialUser } from "@/actions/server/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decryptData } from "./encryption";
import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        const result = await loginUser(credentials);
        if (result.success) {
          const user = {
            name: decryptData(result.user.name),
            email: decryptData(result.user.email),
            userId: result.user.userId,
            role: result.user.role,
            isVerified: result?.user?.isVerified ?? false,
          };
          return user;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser, trigger }) {
      // console.log({account,token,user,profile,isNewUser})
      if (account?.provider === "google") {
        const data = {
          name: user.name,
          email: user.email,
          image: user.image,
          provider: account.provider,
          isVerified: profile.email_verified,
        };
        const result = await saveSocialUser(data);
        if (result.success) {
          token.userId = result?.user?.userId;
          token.role = result?.user?.role;
          token.isVerified = result?.user?.isVerified;
        }
      } else if (account?.provider === "credentials") {
        token.userId = user?.userId;
        token.role = user?.role;
        token.isVerified = user?.isVerified;
      } 
      if (trigger === "update") {
        // console.log("update triggered")
        const userInfo = await getUserInfo(token.email);
        // console.log("UserInfo Log:", { email: token.email, userInfo })
        if (userInfo.success) {
          token.role = userInfo?.user?.role;
          token.isVerified = userInfo?.user?.isVerified;
        }
      }
      return token;
    },
  },
};
