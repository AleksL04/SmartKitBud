import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are public and should not require authentication
const publicRoutes = ['/login', '/about'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the requested path is a public route
  if (publicRoutes.includes(pathname)) {
    // If it's a public route, let the user proceed
    return NextResponse.next();
  }

  // 2. If it's not a public route, check for an authentication token
  const authToken = request.cookies.get('pb_auth')?.value;

  // 3. If there is no token, redirect to the login page
  if (!authToken) {
    console.log('No auth token found, redirecting to login.');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. If the token exists, allow the request to continue
  // (For higher security, you would also verify the token's validity here)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

