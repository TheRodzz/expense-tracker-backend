import { createSupabaseServerClientWithAuthHeader } from "@/lib/supabase/server";
import { GetExpensesByRelationQuerySchema, PathUUIDSchema } from "@/lib/zod/schemas";
import { handleError, handleSuccess, handleAuthError } from '@/lib/supabase/utils';
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ paymentMethodId: string }> }
) {
    try {
        // Await the dynamic route params
        const { paymentMethodId } = await context.params;

        const { supabase, user, error: authError } = await createSupabaseServerClientWithAuthHeader(request);
        if (authError || !user || !supabase) {
            return handleAuthError();
        }

        // Validate path parameter
        const pathValidation = PathUUIDSchema.safeParse({ id: paymentMethodId });
        if (!pathValidation.success) {
            return handleError(pathValidation.error);
        }
        const validatedPaymentMethodId = pathValidation.data.id;

        // Validate query parameters
        const { searchParams } = new URL(request.url);
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
          }
        const queryValidation = GetExpensesByRelationQuerySchema.safeParse(Object.fromEntries(searchParams));
        if (!queryValidation.success) {
            return handleError(queryValidation.error);
        }
        const { startDate, endDate, skip, limit } = queryValidation.data;

        // Fetch from DB
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .eq('payment_method_id', validatedPaymentMethodId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) {
            console.error("Error fetching expenses by payment method:", error);
            throw error;
        }

        return handleSuccess(expenses);
    } catch (err) {
        console.error("Error in GET /expenses/payment-method/[paymentMethodId]:", err);
        return handleError(err);
    }
}
