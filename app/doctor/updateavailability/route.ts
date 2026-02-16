import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust this path if needed
import { updateAvailability } from '../../../lib/actions'; // Your function from previous step

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.doctorId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const {
    doctor_id,
    originalStartTime,
    originalEndTime,
    newStartTime,
    newEndTime,
  } = body;

  console.log('Received body:', body);

  if (
    doctor_id === undefined ||
    !originalStartTime ||
    !originalEndTime ||
    !newStartTime ||
    !newEndTime
  ) {
    return NextResponse.json(
      { message: 'Missing required fields: doctor_id, originalStartTime, originalEndTime, newStartTime, newEndTime' },
      { status: 400 }
    );
  }

  const result = await updateAvailability({
    doctor_id,
    originalStartTime,
    originalEndTime,
    newStartTime,
    newEndTime,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}