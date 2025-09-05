import { SignJWT, jwtVerify } from 'jose';

// Get the secret key and encode it for jose
const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

// Function to encrypt a session payload
export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // Set session expiration to 1 day
        .sign(key);
}

// Function to decrypt and verify a session
export async function decrypt(input: string): Promise<Record<string, unknown> | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}