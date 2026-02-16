import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth'; // Adjust path if needed
import { deleteAvailability } from '../../../../lib/actions'; // Adjust path
import { AvailabilityType } from '../../../../utils/types'; // Adjust path
import { NextRequest,NextResponse } from 'next/server';


export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.doctorId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { availability } = body;

  if (!availability) {
    return NextResponse.json({ message: 'Missing availability' }, { status: 400 });
  }

  const result = await deleteAvailability(availability, Number(session?.user?.doctorId));
  console.log('Deleting availability for doctor_id:', session?.user?.doctorId, availability);

  if (result?.message) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json({ message: 'Availability deleted successfully' }, { status: 200 });
}