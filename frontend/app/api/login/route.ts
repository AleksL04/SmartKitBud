import { NextResponse } from 'next/server';
import { encrypt } from '../../lib/session'; // Your session encryption utility
import { cookies } from 'next/headers';

// It's best practice to store your external API URL in an environment variable
const AUTH_API_URL = process.env.AUTH_API_URL || 'http://127.0.0.1:8090/api/collections/users/auth-with-password';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    try {
        // Step 1: Securely send credentials to your authentication service (e.g., PocketBase)
        const authResponse = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password }),
        });

        // If credentials are wrong, the service will return an error
        if (!authResponse.ok) {
            return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
        }

        const authData = await authResponse.json();
        const { record: user, token: externalApiToken } = authData;

        // Step 2: Create the secure, encrypted session if authentication succeeds
        if (user && externalApiToken) {
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            const sessionPayload = { user, externalApiToken, expires };
            const session = await encrypt(sessionPayload);

            // Step 3: Set the HttpOnly cookie. The browser is now authenticated.
            (await cookies()).set('session', session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: expires,
                path: '/',
            });

            return NextResponse.json({ success: true, user });
        }

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
    
    // Fallback error if something unexpected happens
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
}