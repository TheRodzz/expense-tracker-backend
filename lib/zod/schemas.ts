// lib/zod/schemas.ts
import { z } from 'zod';

const UUIDSchema = z.string().uuid({ message: "Invalid UUID format" });

export const CategoryCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
});
export type CategoryCreatePayload = z.infer<typeof CategoryCreateSchema>;

export const PaymentMethodCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
});
export type PaymentMethodCreatePayload = z.infer<typeof PaymentMethodCreateSchema>;

export const ExpenseTypeEnum = z.enum(['Need', 'Want', 'Investment']);

export const ExpenseCreateSchema = z.object({
    timestamp: z.string().datetime({ message: "Invalid ISO 8601 timestamp format" }),
    category_id: UUIDSchema,
    description: z.string().max(255, "Description cannot exceed 255 characters").optional().nullable(),
    amount: z.number().positive({ message: "Amount must be positive" }),
    payment_method_id: UUIDSchema,
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
    type: ExpenseTypeEnum,
});
export type ExpenseCreatePayload = z.infer<typeof ExpenseCreateSchema>;

export const ExpenseUpdateSchema = z.object({
    timestamp: z.string().datetime({ message: "Invalid ISO 8601 timestamp format" }).optional(),
    category_id: UUIDSchema.optional(),
    description: z.string().max(255, "Description cannot exceed 255 characters").optional().nullable(),
    amount: z.number().positive({ message: "Amount must be positive" }).optional(),
    payment_method_id: UUIDSchema.optional(),
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
    type: ExpenseTypeEnum.optional(),
}).refine(obj => Object.keys(obj).length > 0, {
    message: "At least one field must be provided for update", // Ensure body is not empty
});
export type ExpenseUpdatePayload = z.infer<typeof ExpenseUpdateSchema>;

// Schema for GET /expenses query parameters
export const GetExpensesQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    categoryId: UUIDSchema.optional(),
    paymentMethodId: UUIDSchema.optional(),
    type: ExpenseTypeEnum.optional(),
    skip: z.coerce.number().int().min(0).default(0).optional(), // coerce tries to convert string to number
    limit: z.coerce.number().int().min(1).max(500).default(100).optional(),
});

// Schema for GET /categories query parameters
export const GetCategoriesQuerySchema = z.object({
    skip: z.coerce.number().int().min(0).default(0).optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100).optional(),
});

// Schema for GET /payment_methods query parameters
export const GetPaymentMethodsQuerySchema = z.object({
    skip: z.coerce.number().int().min(0).default(0).optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100).optional(),
});

// Schema for GET /analytics/summary query parameters
export const GetAnalyticsSummaryQuerySchema = z.object({
    startDate: z.string().datetime({ message: "startDate is required and must be a valid ISO 8601 date" }),
    endDate: z.string().datetime({ message: "endDate is required and must be a valid ISO 8601 date" }),
    groupBy: z.enum(['category', 'paymentMethod', 'type'], {
        errorMap: () => ({ message: "groupBy must be one of: 'category', 'paymentMethod', 'type'" })
    }),
    period: z.string().optional(), // Not strictly validated, depends on implementation
});