import { GetExpensesByRelationQuerySchema, PathUUIDSchema } from "@/lib/zod/schemas";
import { createSupabaseServerClientWithAuthHeader } from "@/lib/supabase/server";
import { handleError, handleSuccess, handleAuthError } from '@/lib/supabase/utils';
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ categoryId: string }> }
) {
    try {
        // Await the params promise to access route parameters
        const { categoryId } = await context.params;

        const { supabase, user, error: authError } = await createSupabaseServerClientWithAuthHeader(request);
        if (authError || !user || !supabase) {
            return handleAuthError();
        }

        // Validate path parameter (categoryId)
        const pathValidation = PathUUIDSchema.safeParse({ id: categoryId });
        if (!pathValidation.success) {
            return handleError(pathValidation.error);
        }
        const validatedCategoryId = pathValidation.data.id;

        // Validate query parameters
        const { searchParams } = new URL(request.url);
        const queryValidation = GetExpensesByRelationQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleError(queryValidation.error);
        }
        const { startDate, endDate, skip, limit } = queryValidation.data;

        // Fetch expenses from Supabase
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .eq('category_id', validatedCategoryId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) {
            console.error("Error fetching expenses by category:", error);
            throw error;
        }

        return handleSuccess(expenses);
    } catch (err) {
        console.error("Error in GET /expenses/category/[categoryId]:", err);
        return handleError(err);
    }
}
