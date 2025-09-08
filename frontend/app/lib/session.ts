import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// Get the secret key and encode it for jose
const secretKey = process.env.SESSION_SECRET as string;
const key = new TextEncoder().encode(secretKey);

// Define the shape of the data stored in the JWT session
export interface SessionPayload extends JWTPayload {
  user: {
    id: string;
    [key: string]: unknown; // Allows for other user properties
  };
  externalApiToken: string;
  expires?: Date;
}

// Function to encrypt a session payload
export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // Set session expiration to 1 day
        .sign(key);
}

// Function to decrypt and verify a session
export async function decrypt(input: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify<SessionPayload>(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        // Errors like "JWTExpired" will be caught here
        console.error('JWT verification failed:', error);
        return null;
    }
}