import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
        if (asd) {
          const valid = await bcrypt.compare(password, asd.password);
          if (!valid) return null;
          return { id: asd.id, name: asd.name, email: asd.email, role: "ASD" };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, role: "PARENT" };
        }

        return null;
      },
    }),
  ],
});
