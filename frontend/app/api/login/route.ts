import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { serialize } from 'cookie';

// It's recommended to move your PocketBase initialization to a shared lib file
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Authenticate with PocketBase
    const authData = await pb.collection('users').authWithPassword(email, password);

    // 2. Serialize the auth token and other user data into a cookie
    const cookie = serialize('pb_auth', pb.authStore.exportToCookie(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'strict' can be too restrictive for some auth flows
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // 3. Set the cookie in the response headers
    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: authData.record 
    });
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (err: unknown) {
    console.error('Login API Error:', err);
    // PocketBase often returns detailed error objects
    const errorMessage = (typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message?: unknown }).message)
                    : "Invalid credentials.");
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 401 }
    );
  }
}
