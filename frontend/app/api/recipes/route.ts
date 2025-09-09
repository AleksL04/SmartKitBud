import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, type SessionPayload } from '../../lib/session'; //

const SPOONACULAR_API_KEY = process.env.SPOONTACULAR_KEY;

export async function POST(request: Request) {
    const cookie = (await cookies()).get('session')?.value;
    const session: SessionPayload | null = await decrypt(cookie ?? '');

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized: You must be logged in.' },
            { status: 401 }
        );
    }

    if (!SPOONACULAR_API_KEY) {
        return NextResponse.json(
            { error: 'Spoonacular API key is not configured.' },
            { status: 500 }
        );
    }

    try {
        const { ingredients } = await request.json();

        if (!ingredients || typeof ingredients !== 'string') {
            return NextResponse.json(
                { error: 'Ingredients must be provided as a string.' },
                { status: 400 }
            );
        }

        const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
            ingredients
        )}&number=9&ranking=2&ignorePantry=true&apiKey=${SPOONACULAR_API_KEY}`;

        const apiResponse = await fetch(spoonacularUrl);
        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error('Spoonacular API Error:', data);
            return NextResponse.json(
                { error: data.message || 'Failed to fetch recipes.' },
                { status: apiResponse.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json(
            { error: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}