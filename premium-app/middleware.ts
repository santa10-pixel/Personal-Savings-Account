import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith('/admin/dashboard') && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (pathname === '/admin/login' && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Protect Consumer Shopping Routes
  const isProtectedConsumerRoute = pathname.startsWith('/shop') || pathname.startsWith('/category');
  if (isProtectedConsumerRoute && !authToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Prevent logged-in users from seeing login page
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/login', '/shop/:path*', '/category/:path*', '/login'],
};
