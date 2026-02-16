import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      patientId?: number | null; 
      doctorId?: number | null; 
    }& DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role?: string;
    patientId?: number;
    doctorId?: number;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    patientId?: number;
    doctorId?: number;
  }
}