import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  // Clear the auth cookie by setting it to expire in the past
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Set-Cookie': `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` // Expire cookie
    }
  });
}
