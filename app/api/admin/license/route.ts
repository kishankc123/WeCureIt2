// app/api/license/route.ts
import { NextResponse } from 'next/server';
import { addLicense, deleteLicense } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const req = await request.json();
    await addLicense(req);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add license' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const req = await request.json();
    const res = await deleteLicense(req);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete license' }, { status: 500 });
  }
}