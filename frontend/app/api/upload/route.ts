import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../lib/session';
import { processImageToNormalizedJson } from '../../lib/ai';

// Helper function to convert a file to a base64 string
async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
    // 1. Verify user authentication
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie ?? '');

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized: You must be logged in to upload files.' },
            { status: 401 }
        );
    }

    // 2. Extract the file from the FormData
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    try {
        // 3. Process the image directly within the Next.js backend
        const base64Image = await fileToBase64(file);
        const finalJsonString = await processImageToNormalizedJson(base64Image);

        let finalJson;
        try {
            const cleanedString = finalJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
            finalJson = JSON.parse(cleanedString);
        } catch (parseError) {
            console.error("Failed to parse JSON from AI response:", finalJsonString);
            throw new Error("AI returned a response that was not valid JSON.");
        }
        
        return NextResponse.json({ text: finalJson });

    } catch (error) {
        console.error('Error in upload handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process receipt.', details: errorMessage }, { status: 500 });
    }
}