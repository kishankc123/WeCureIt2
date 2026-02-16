// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { User } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) throw new Error("User not found");

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) throw new Error("Invalid password");

          // Base user object with required fields
          const authUser: User & {
            role?: string;
            patientId?: number;
            doctorId?: number;
          } = {
            id: String(user.userId),
            email: user.email,
            name: user.name || undefined,
            role: user.role || undefined,
          };

          // Add role-specific IDs
          if (user.role === "patient") {
            const patientData = await prisma.patientInfo.findFirst({
              where: { userId: user.userId },
            });
            if (patientData) {
              authUser.patientId = patientData.patientId;
            }
          } else if (user.role === "doctor") {
            const doctorData = await prisma.doctor.findFirst({
              where: { userId: user.userId },
            });
            if (doctorData) {
              authUser.doctorId = doctorData.doctorId;
            }
          }

          return authUser;
        } catch (error: any) {
          console.error("Error during user authentication:", error);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.patientId = (user as any).patientId;
        token.doctorId = (user as any).doctorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.patientId = token.patientId as number | undefined;
        session.user.doctorId = token.doctorId as number | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/general/login",
    signOut: "/general/logout",
    error: "/general/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};