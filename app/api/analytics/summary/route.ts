// app/api/analytics/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientWithAuthHeader } from '@/lib/supabase/server';
import { GetAnalyticsSummaryQuerySchema } from '@/lib/zod/schemas';
import { handleError, handleSuccess, handleAuthError } from '@/lib/supabase/utils';

// Define the expected structure of the result
interface AnalyticsResult {
    label: string; // Category name or Payment Method name
    value: number; // Total amount
    id: string;    // ID of the category or payment method
}

export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await createSupabaseServerClientWithAuthHeader(request);
        if (!supabase || !user) return handleAuthError();

        // Validate query parameters
        const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const validationResult = GetAnalyticsSummaryQuerySchema.safeParse(queryParams);

        if (!validationResult.success) {
            throw validationResult.error; // Let handleError format the 400 response
        }
        const { startDate, endDate, groupBy } = validationResult.data;

        // Fetch expenses within the date range, including related data based on groupBy
        let query = supabase
            .from('expenses')
            .select(`
                amount,
                ${groupBy === 'category' ? 'categories (id, name)' : 'payment_methods (id, name)'}
            `)
            // RLS applies user_id filter automatically
            .gte('timestamp', startDate)
            .lte('timestamp', endDate);

        const { data: expenses, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (!expenses) {
            // Handle case where expenses might be null/undefined even without an error
            return handleSuccess<AnalyticsResult[]>([]);
        }

        // Aggregate the results in application code
        const summary = expenses.reduce<Record<string, AnalyticsResult>>((acc, expense) => {
            let relatedData;
            let id: string | null = null;
            let name: string | null = null;

            if (groupBy === 'category') {
                 const categoryData = (expense as any).categories as { id: string; name: string } | null;
                 if (categoryData) {
                    id = categoryData.id;
                    name = categoryData.name;
                 }
            } else if (groupBy === 'paymentMethod') {
                 const pmData = (expense as any).payment_methods as { id: string; name: string } | null;
                 if (pmData) {
                     id = pmData.id;
                     name = pmData.name;
                 }
            }

            // Skip if related data is missing (shouldn't happen with non-nullable FKs, but good practice)
            if (!id || name === null || name === undefined) {
                 console.warn(`Skipping expense due to missing related data for groupBy=${groupBy}:`, expense);
                 return acc;
            }

            if (!acc[id]) {
                acc[id] = { id: id, label: name, value: 0 };
            }
            acc[id].value += expense.amount;

            return acc;
        }, {});

        // Convert the aggregated map back to an array and round values
        const resultsArray = Object.values(summary).map(item => ({
            ...item,
            value: parseFloat(item.value.toFixed(2)) // Round to 2 decimal places
        }));;

        // Sort results by value descending
        resultsArray.sort((a, b) => b.value - a.value);

        return handleSuccess<AnalyticsResult[]>(resultsArray);

    } catch (error) {
        // handleError handles ZodErrors, PostgrestErrors, and general errors
        return handleError(error);
    }
}