// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Option 1: Create client based on cookies (typical for server components/actions)
export function createSupabaseServerClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );
}

// Option 2: Create client based on Authorization header (for stateless API routes)
// export async function createSupabaseServerClientWithAuthHeader(req: NextRequest) {
//     const authHeader = req.headers.get('Authorization');
//     const token = authHeader?.split('Bearer ')[1];

//     const supabase = createServerClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//         {
//             cookies: {}, // No cookie handling needed when using explicit token
//             global: {
//                 // Set the Authorization header for subsequent requests made by the client
//                 headers: token ? { Authorization: `Bearer ${token}` } : {},
//             },
//         }
//     );

//     // Verify the token and get user data
//     if (token) {
//         const { data: { user }, error } = await supabase.auth.getUser(token);
//         if (error || !user) {
//              console.error("Auth Header Error:", error);
//              return { supabase: null, user: null, error: error || new Error("Invalid token") };
//         }
//         return { supabase, user, error: null };
//     } else {
//         return { supabase: null, user: null, error: new Error("Missing Authorization header") };
//     }
// }

export async function createSupabaseServerClientWithAuthHeader(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];
  
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
        console.error("Auth Header Error:", error);
        return { supabase: null, user: null, error: error || new Error("Invalid token") };
      }
      return { supabase, user, error: null };
    } else {
      return { supabase: null, user: null, error: new Error("Missing Authorization header") };
    }
  }

//  might also need a service role client for specific tasks bypassing RLS
// Use this *very* carefully. Only if absolutely necessary.
// import { createClient } from '@supabase/supabase-js';
// export const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// );