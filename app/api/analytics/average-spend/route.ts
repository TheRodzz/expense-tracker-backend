import { NextRequest } from 'next/server';
import { createSupabaseServerClientWithAuthHeader } from '@/lib/supabase/server';
import { GetAverageCategorySpendQuerySchema } from '@/lib/zod/schemas';
import { handleError, handleSuccess, handleAuthError } from '@/lib/supabase/utils';

// Define the expected structure of the result
interface AverageSpendResult {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    expenseCount: number;
    averageAmount: number;
}

export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await createSupabaseServerClientWithAuthHeader(request);
        if (!supabase || !user) return handleAuthError();

        // Validate query parameters
        const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const validationResult = GetAverageCategorySpendQuerySchema.safeParse(queryParams);

        if (!validationResult.success) {
            throw validationResult.error;
        }
        const { startDate, endDate } = validationResult.data;

        // Fetch expenses with category data within the date range
        const { data: expenses, error: fetchError } = await supabase
            .from('expenses')
            .select(`
                amount,
                categories (id, name)
            `)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate);

        if (fetchError) throw fetchError;

        if (!expenses) {
            return handleSuccess<AverageSpendResult[]>([]);
        }

        // Aggregate total amount and count per category
        const summary = expenses.reduce<Record<string, { total: number; count: number; name: string }>>((acc, expense) => {
            const categoryData = (expense as any).categories as { id: string; name: string } | null;

            if (categoryData) {
                const { id, name } = categoryData;
                if (!acc[id]) {
                    acc[id] = { total: 0, count: 0, name: name };
                }
                acc[id].total += expense.amount;
                acc[id].count += 1;
            }
             // Optionally log/handle expenses without a category if that's possible in your data

            return acc;
        }, {});

        // Calculate average and format results
        const resultsArray: AverageSpendResult[] = Object.entries(summary).map(([categoryId, data]) => ({
            categoryId: categoryId,
            categoryName: data.name,
            totalAmount: parseFloat(data.total.toFixed(2)),
            expenseCount: data.count,
            averageAmount: parseFloat((data.total / data.count).toFixed(2)),
        }));

        // Sort results by average amount descending
        resultsArray.sort((a, b) => b.averageAmount - a.averageAmount);

        return handleSuccess<AverageSpendResult[]>(resultsArray);

    } catch (error) {
        return handleError(error);
    }
} 