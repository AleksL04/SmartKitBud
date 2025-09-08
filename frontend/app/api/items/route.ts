import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import { decrypt, type SessionPayload } from '../../lib/session';

export async function GET(request: Request) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    // 1. Authenticate the user from the session cookie
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Authentication token not found.' }, { status: 401 });
    }

    const session: SessionPayload | null = await decrypt(cookie);
    if (!session?.user?.id || !session.externalApiToken) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }
    
    // Authenticate the PocketBase instance with the token from the session.
    pb.authStore.save(session.externalApiToken, null);

    // 2. Fetch all records from the 'receipt_items' collection for the current user
    const records = await pb.collection('receipt_items').getFullList({
      filter: `owner = "${session.user.id}"`,
      sort: '-created',
    });

    // 3. Return the fetched records
    return NextResponse.json(records, { status: 200 });

  } catch (error: any) {
    console.error('API Get Items Error:', error);
    // This will also catch expired tokens when pb.authStore.save fails
    if (error.status === 401) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch items due to a server error.' }, { status: 500 });
  }
}