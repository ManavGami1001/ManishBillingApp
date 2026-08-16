import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      tenantId: string;
      tenantName?: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    tenantId: string;
    tenantName?: string;
    role: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string;
    tenantName?: string;
    role: string;
    username: string;
  }
}
