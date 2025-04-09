// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClientWithAuthHeader } from './lib/supabase/server'; // Adjust path if needed

export async function middleware(request: NextRequest) {
    // Only apply middleware to API routes
    if (!request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Skip auth for potential auth routes (e.g., /api/auth/callback) if you have them
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Analytics might be public or have different rules, adjust if needed
    // if (request.nextUrl.pathname.startsWith('/api/analytics')) {
    //     return NextResponse.next();
    // }

    const { user, error } = await createSupabaseServerClientWithAuthHeader(request);

    if (error || !user) {
        console.error("Middleware Auth Error:", error?.message || "User not found");
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized: ' + (error?.message || "Authentication required") }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Add user info to headers to pass it down to route handlers if needed
    // Note: Route handlers will re-create their own client anyway for RLS to work correctly,
    // so this header passing is optional unless you have other uses for user info directly.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', user.id); // Example header

    // Continue to the requested route
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: '/api/:path*', // Apply middleware to all routes under /api/
};