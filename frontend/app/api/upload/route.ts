import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../lib/session'; // Ensure this path to your session helpers is correct

// It's best practice to store your external API URL in an environment variable
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://127.0.0.1:3005/scan-receipt';

export async function POST(request: NextRequest) {
    // 1. Verify the user is authenticated by decrypting the session cookie.
    // This is the security checkpoint for your API route. 🛡️
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie ?? '');

    if (!session?.user || !session?.externalApiToken) {
        return NextResponse.json(
            { error: 'Unauthorized: You must be logged in to upload files.' },
            { status: 401 }
        );
    }

    // 2. Extract the file from the incoming request's FormData.
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
        return NextResponse.json({ error: 'No file was provided in the request.' }, { status: 400 });
    }

    try {
        // 3. Forward the FormData to your external service.
        // The Authorization header uses the token we safely stored in the user's session.
        const externalApiResponse = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.externalApiToken}`,
            },
            body: formData,
        });

        // 4. Return the response from the external service back to the client.
        const result = await externalApiResponse.json();
        if (!externalApiResponse.ok) {
            return NextResponse.json(result, { status: externalApiResponse.status });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error proxying file upload:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}