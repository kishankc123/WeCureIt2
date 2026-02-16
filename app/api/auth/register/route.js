import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Email already registered:", email);
      return new Response(
        JSON.stringify({ error: "Email is already registered" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    if (role === 'patient') {
      const patientInfo = await prisma.patientInfo.create({
        data: {
          userId: user.userId,
        },
      });

      return new Response(
        JSON.stringify({
          message: "User created successfully",
          user: {
            userId: user.userId,
            email: user.email,
            role: user.role,
            patientId: patientInfo.patientId,
          },
        }),
        { status: 201 }
      );
    } else if (role === 'doctor') {
      const doctorInfo = await prisma.doctor.create({
        data: {
          userId: user.userId,
        },
      });

      return new Response(
        JSON.stringify({
          message: "User created successfully",
          user: {
            userId: user.userId,
            email: user.email,
            role: user.role,
            doctorId: doctorInfo.doctorId,
          },
        }),
        { status: 201 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "User created successfully",
          user: {
            userId: user.userId,
            email: user.email,
            role: user.role,
          },
        }),
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({ error: "Failed to register user" }),
      { status: 500 }
    );
  }
}
