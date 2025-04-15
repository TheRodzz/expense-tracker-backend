import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Login failed:', error?.message || 'No session returned');
      return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 });
    }

    const accessToken = data.session.access_token;

    // Set the JWT as an HTTP-only, Secure cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set(
      'Set-Cookie',
      `auth_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` // 7 days
    );
    return response;

  } catch (err: unknown) {
    console.error('Unexpected error during login:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


