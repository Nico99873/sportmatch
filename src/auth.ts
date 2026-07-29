import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const asd = await prisma.asd.findUnique({ where: { email } });
        if (!asd) return null;

        const valid = await bcrypt.compare(password, asd.password);
        if (!valid) return null;

        return { id: asd.id, name: asd.name, email: asd.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.asdId = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.asdId as string;
      }
      return session;
    },
  },
});
