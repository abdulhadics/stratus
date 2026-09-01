import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('stratus_auth_token');
    
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
