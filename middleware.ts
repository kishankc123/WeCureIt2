import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  console.log('Middleware running for:', req.nextUrl.pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    console.log('No token found. Redirecting to /login');
    return NextResponse.redirect(new URL('/general/login', req.url));
  }

  const role = token.role;
  console.log('User role:', role);

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin') && role !== 'admin') {
    console.log('Unauthorized access to /admin');
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/doctor') && role !== 'doctor') {
    console.log('Unauthorized access to /doctor');
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/patient') && role !== 'patient') {
    console.log('Unauthorized access to /patient');
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  console.log('Access allowed');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/patient/:path*'],
};
