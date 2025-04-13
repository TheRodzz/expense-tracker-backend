// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClientWithAuthHeader } from './lib/supabase/server'; // Adjust path if needed

export async function middleware(request: NextRequest) {
    
    // --- Add this block to handle OPTIONS requests --- 
    // Respond successfully to OPTIONS preflight requests before any auth check
    if (request.method === 'OPTIONS') {
        // Next.js will automatically add CORS headers from next.config.js
        return new NextResponse(null, { status: 204 }); 
    }
    // --- End OPTIONS handling ---

    // Only apply further checks to API routes (already handled by matcher, but good defense)
    if (!request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Skip auth for auth routes
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // --- Proceed with Authentication for non-OPTIONS requests ---
    const { user, error } = await createSupabaseServerClientWithAuthHeader(request);

    if (error || !user) {
        if(error){
            console.log("error:" + error);
        }
        console.error("Middleware Auth Error:", error?.message || "User not found");
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized: ' + (error?.message || "Authentication required") }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Add user info to headers (optional)
    request.headers.set('X-User-Id', user.id); 

    // Continue to the requested route
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*', // Apply middleware to all routes under /api/
};