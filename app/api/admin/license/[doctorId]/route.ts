// /app/api/license/[doctorId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLicenses } from '@/lib/db';

export async function GET(req: NextRequest) {
    const doctor_id = req.nextUrl.pathname.split('/').pop();
    const data = await getLicenses(Number(doctor_id));
    return NextResponse.json(data ?? []);
}