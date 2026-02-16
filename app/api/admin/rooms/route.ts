// app/api/rooms/route.ts
import { NextResponse } from 'next/server';
import { createRoom, updateRoom, deleteRoom } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const req = await request.json();
    const new_exam_room_id = await createRoom(req);

    return NextResponse.json({
      success: true,
      data: new_exam_room_id // Return the created room
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const req = await request.json();
    const res = await updateRoom(req);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}
