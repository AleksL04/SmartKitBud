import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from './app/lib/session';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/upload'];
const publicRoutes = ['/login'];

export default async function middleware(request: NextRequest) {
    // 2. Check if the current route is a protected or public route
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

    // 3. Decrypt the session from the 'session' cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie ?? '');

    // 4. Redirect to /login if the user is not authenticated and is accessing a protected route
    if (isProtectedRoute && !session?.user) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // 5. Redirect to /dashboard if the user is authenticated and is accessing a public route
    if (isPublicRoute && session?.user && !path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }

    // 6. If no redirection logic matches, allow the request to proceed
    return NextResponse.next();
}

// 7. Specify routes on which the middleware should not run
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - any files with a .png extension
         */
        '/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)',
    ],
};