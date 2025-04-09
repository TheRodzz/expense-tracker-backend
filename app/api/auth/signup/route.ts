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

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('Signup failed:', error?.message || 'No user returned');
      return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 400 });
    }

    // Return the user's info (not session yet — email confirmation may be required depending on Supabase settings)
    return NextResponse.json(
      {
        message: 'Signup successful. Check your email for confirmation (if enabled).',
        user: data.user,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Unexpected error during signup:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
