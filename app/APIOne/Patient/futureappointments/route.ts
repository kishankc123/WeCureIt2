import { getServerSession } from "next-auth";
import { authOptions}  from "../../../../lib/auth"; // ✅ SAFE import
import { getFutureAppointmentByPatientId } from "../../../../utils/types"; // adjust path if needed
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check for both patientId and userId in session
    if (!session?.user?.patientId ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedPatientId = searchParams.get("patientId");

    if (!requestedPatientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    // Verify against the correct ID (patientId)
    if (String(session.user.patientId) !== requestedPatientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use the correct patient_id from session
    const appointments = await getFutureAppointmentByPatientId(Number(session.user.patientId));
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}