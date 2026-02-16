// app/api/Patient/Appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../utils/db';
import client from '../../../../utils/db';

export async function POST(req: NextRequest) {
  try {
    const client = await db; // 👈 wait for the connected client

    const body = await req.json();
    console.log("🟡 Received body:", body);

    const {
      patient_id,
      doctor_id,
      date,
      start_time,
      duration,
      clinic_id,
      exam_room_id,
    } = body;

    const doctorUser = await client.query(
      'SELECT user_id FROM doctors WHERE doctor_id = $1',
      [doctor_id]
    );

    if (doctorUser.rowCount === 0) {
      return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
    }

    const user_id = doctorUser.rows[0].user_id;
    console.log("🟡 User ID of the doctor:", user_id);

    // Validate date format (yyyy-MM-dd)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: 'Invalid date format. Expected yyyy-MM-dd' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM:SS)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(start_time)) {
      return NextResponse.json(
        { message: 'Invalid time format. Expected HH:MM:SS' },
        { status: 400 }
      );
    }

    // Rest of your validation
    if (
      !doctor_id ||
      !duration ||
      !clinic_id ||
      !exam_room_id
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const query = `
  INSERT INTO appointment 
    (patient_id, doctor_id, date, start_time, duration, clinic_id, exam_room_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

    const values = [
      Number(patient_id),
      user_id,
      date,
      start_time,
      Number(duration),
      Number(clinic_id),
      Number(exam_room_id)
    ];

    console.log("🟢 Running DB query with values:", values);
    await client.query(query, values);

    return NextResponse.json({ message: 'Appointment booked successfully' });
  } catch (error: any) {
    console.error("🔴 Error during booking:", error);
    return NextResponse.json(
      { message: error.message || 'Failed to book appointment' },
      { status: 500 }
    );
  }
}