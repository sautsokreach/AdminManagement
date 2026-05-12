import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no db, no bcryptjs — used by middleware for JWT verification only.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
