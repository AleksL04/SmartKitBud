import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function GET() {
  // To log the user out, we clear the cookie by setting its maxAge to -1.
  const serializedCookie = serialize("pb_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Expire the cookie immediately
    path: "/",
  });

  return new NextResponse(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: { "Set-Cookie": serializedCookie },
  });
}
