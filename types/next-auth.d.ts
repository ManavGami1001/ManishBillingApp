import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      tenantName: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    tenantId: string;
    tenantName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    tenantName: string;
  }
}
