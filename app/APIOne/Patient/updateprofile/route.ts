import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { updateUser } from "../../../../utils/types"; // adjust path
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone_number, address, gender, dob } = body;

    if (!name || !phone_number || !address || !gender || !dob) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedUser = await updateUser(Number(session.user.id), {
      name,
      phone_number,
      address,
      gender,
      dob,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found or not updated" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("🔴 Profile update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
