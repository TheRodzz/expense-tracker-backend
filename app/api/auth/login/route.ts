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

    return NextResponse.json({ token: accessToken }, { status: 200 });

  } catch (err: any) {
    console.error('Unexpected error during login:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


