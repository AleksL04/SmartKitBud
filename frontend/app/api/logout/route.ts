import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    // To logout, just delete the session cookie.
    (await cookies()).set('session', '', { httpOnly: true, expires: new Date(0) });
    return NextResponse.json({ message: 'Logout successful!' });
}