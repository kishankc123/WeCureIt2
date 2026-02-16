// app/api/Doctor/route.ts

import { NextResponse } from 'next/server';
import { getDoctors } from '../../../../utils/types'; // adjust path if needed

export async function GET() {
  try {
    const doctors = await getDoctors();
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching doctors' },
      { status: 500 }
    );
  }
}
