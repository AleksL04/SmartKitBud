import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import { decrypt, type SessionPayload } from '../../lib/session';

export async function POST(request: Request) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Authentication token not found.' }, { status: 401 });
    }

    const session: SessionPayload | null = await decrypt(cookie);
    if (!session?.user?.id || !session.externalApiToken) {
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }

    pb.authStore.save(session.externalApiToken, null);

    const items = await request.json();

    if (!Array.isArray(items)) {
        return NextResponse.json({ error: 'Invalid data format. Expected an array of items.' }, { status: 400 });
    }

    const userId = session.user.id;

    for (const item of items) {
      const newRecord = {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category, // This line was missing
        owner: userId,
      };
      
      await pb.collection('receipt_items').create(newRecord);
    }
    
    return NextResponse.json({ success: true, message: `${items.length} items saved successfully.` }, { status: 200 });

  } catch (error: unknown) {
    console.error('API Commit Error:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number' &&
      (error as { status: number }).status === 401
    ) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to save items due to a server error.' }, { status: 500 });
  }
}