// File: app/apione/doctor/addavailability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { addAvailability } from '../../../../lib/actions';
import { AvailabilityType } from '../../../../utils/types';

// File: app/apione/doctor/addavailability/route.ts

export async function POST(req: NextRequest) {
  const session = await getServerSession({req,...authOptions});

  if (!session?.user?.doctorId) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized - doctor ID missing from session' },
      { status: 401 }
    );
  }

  const doctor_id = Number(session.user.doctorId);
  if (isNaN(doctor_id) || doctor_id <= 0) {
    return NextResponse.json(
      { success: false, message: 'Invalid doctor ID' },
      { status: 400 }
    );
  }

  let availability: AvailabilityType;
  try {
    const body = await req.json();
    availability = body.availability;

    if (!availability) {
      throw new Error('Missing availability object');
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing JSON body' },
      { status: 400 }
    );
  }

  const { date, start_time, end_time } = availability;
  if (!date || !start_time || !end_time) {
    return NextResponse.json(
      { success: false, message: 'Missing one or more required fields: date, start_time, end_time' },
      { status: 400 }
    );
  }

  if (start_time >= end_time) {
    return NextResponse.json(
      { success: false, message: 'Start time must be before end time' },
      { status: 400 }
    );
  }

  const result = await addAvailability(availability, doctor_id);

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.message || 'Failed to add availability' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Availability added successfully',
      data: availability,
    },
    { status: 201 }
  );
}
