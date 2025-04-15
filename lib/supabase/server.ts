// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

export async function createSupabaseServerClientWithAuthHeader(req: NextRequest) {
    // Read JWT from 'auth_token' cookie
    const cookieHeader = req.headers.get('cookie');
    let token: string | undefined = undefined;
    if (cookieHeader) {
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      }
    );
  
    // Fetch user
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        console.error("Cookie Auth Error:", error);
        return { supabase: null, user: null, error: error || new Error("Invalid token") };
      }
      return { supabase, user, error: null };
    } else {
      return { supabase: null, user: null, error: new Error("Missing auth_token cookie") };
    }
  }