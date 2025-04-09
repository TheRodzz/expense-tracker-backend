// app/api/payment_methods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientWithAuthHeader } from '@/lib/supabase/server'; // Adjust path
import { PaymentMethodCreateSchema } from '@/lib/zod/schemas'; // Adjust path
import { handleError, handleSuccess, handleAuthError } from '@/lib/supabase/utils'; // Adjust path

export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await createSupabaseServerClientWithAuthHeader(request);
        if (!supabase || !user) return handleAuthError();

        // RLS ensures we only get payment_methods for the authenticated user
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return handleSuccess(data);

    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await createSupabaseServerClientWithAuthHeader(request);
        if (!supabase || !user) return handleAuthError();

        const json = await request.json();
        const payload = PaymentMethodCreateSchema.parse(json);

        // RLS implicitly sets user_id based on the authenticated user
        const { data, error } = await supabase
            .from('payment_methods')
            .insert({ name: payload.name /* user_id set by RLS/default value */ })
            .select() // Return the created object
            .single(); // Expecting a single row back

        if (error) throw error;

        return handleSuccess(data, 201); // 201 Created

    } catch (error) {
        // HandleError will catch ZodErrors (400) and PostgrestErrors (e.g., 409 for unique name violation)
        return handleError(error);
    }
}