import { NextResponse } from 'next/server';
import { deleteAppointment } from '../../../../lib/actions';
import type { AppointmentType } from '../../../../utils/types';

export async function POST(request: Request) {
  try {
    const { appointment, user_id } = await request.json();

    if (!appointment?.appointment_id || !user_id) {
      return NextResponse.json(
        { message: 'Missing appointment_id or user_id' },
        { status: 400 }
      );
    }

    const result = await deleteAppointment(appointment, user_id);

    if (result?.message) {
      return NextResponse.json(
        { message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Appointment cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Optionally add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: 405 }
  );
}