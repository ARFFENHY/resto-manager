import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect /admin
  if (path.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const payload = await verifyToken(sessionCookie.value);
    
    if (!payload) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
    
    // Auth valid, proceed
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
