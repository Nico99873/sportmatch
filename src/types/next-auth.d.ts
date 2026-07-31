import type { DefaultSession } from "next-auth";

export type AccountRole = "ASD" | "PARENT";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AccountRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AccountRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: string;
    role?: AccountRole;
  }
}
