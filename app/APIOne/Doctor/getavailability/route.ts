import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAvailability } from '../../../../utils/types'; // Adjust to correct path
import { AvailabilityType } from '../../../../utils/types'; // Adjust to correct path

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.doctorId) {
    return NextResponse.json(
      { message: 'Unauthorized - Doctor ID not found' },
      { status: 401 }
    );
  }

  try {
    const doctor_id = Number(session.user.doctorId);
    if (isNaN(doctor_id)) {
      return NextResponse.json({ message: 'Invalid Doctor ID' }, { status: 400 });
    }

    const availability: AvailabilityType[] = await getAvailability(doctor_id);
    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
