import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getUserInfo } from "../../../../utils/types"; // adjust path
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserInfo(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }); // ✅ ensure `user.gender` is included
  } catch (error) {
    console.error("User profile fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
