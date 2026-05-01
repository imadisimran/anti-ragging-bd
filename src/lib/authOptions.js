import { loginUser } from "@/actions/server/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decryptData } from "./encryption";
export const authOptions = {
  // Configure one or more authentication providers
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
          };
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    // async redirect({ url, baseUrl }) {
    //     console.log("redirect",{ url, baseUrl });
    //   return baseUrl;
    // },
    async session({ session, user, token }) {
      session.user.userId = token.userId;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
  },
};
