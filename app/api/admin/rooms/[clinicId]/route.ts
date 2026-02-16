// /app/api/rooms/[clinicId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRooms } from '@/lib/db';

export async function GET(req: NextRequest) {
    const clinicId = req.nextUrl.pathname.split('/').pop();
    const data = await getRooms(Number(clinicId));
    return NextResponse.json(data ?? []);
}