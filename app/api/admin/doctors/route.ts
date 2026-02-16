import { NextResponse } from 'next/server';
import { getDoctors } from '@/lib/db';
import { deleteDoctor } from '@/lib/actions';

export async function GET() {
    try {
        const doctors = await getDoctors();
        return NextResponse.json(doctors ?? []);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get all doctors' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        await deleteDoctor(req);
    
        return NextResponse.json({
          success: true
        });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
      }
}