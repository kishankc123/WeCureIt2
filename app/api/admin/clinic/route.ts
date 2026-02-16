import { NextResponse } from 'next/server';
import { getFacilities } from '@/lib/db';
import { deleteFacility, createFacility } from '@/lib/actions';

export async function GET() {
    try {
        const facilities = await getFacilities();
        return NextResponse.json(facilities ?? []);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get all facilities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const req = await request.json();
        const clinic_id = await createFacility(req);
    
        return NextResponse.json({
          success: true,
          data: clinic_id
        });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
      }
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        await deleteFacility(req);
    
        return NextResponse.json({
          success: true
        });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 });
      }
}