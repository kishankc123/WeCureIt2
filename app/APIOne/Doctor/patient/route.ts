import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentHistoryByUserId } from '../../../../utils/types'; // Adjust if needed

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  console.log('Incoming API Call → userId:', userId); // 🔥 DEBUG LOG

  if (!userId) {
    return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
  }

  try {
    const appointments = await getAppointmentHistoryByUserId(Number(userId));
    console.log('Fetched appointments:', appointments); // 🔥 DEBUG LOG
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('API Error:', error); // 🔥 DEBUG LOG
    return NextResponse.json(
      { message: 'Error fetching appointments' },
      { status: 500 }
    );
  }
}
