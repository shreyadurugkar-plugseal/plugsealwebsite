import "server-only";
import { z } from "zod";
import { CATEGORIES } from "@/lib/types";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD format")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const purchaseCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  amount: z.number().positive().max(1_000_000),
  category: z.enum(CATEGORIES),
  date: isoDate,
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((s) => s || undefined),
  isImpulse: z.boolean().optional().default(false),
});

export const purchaseUpdateSchema = purchaseCreateSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, "No fields to update");

export const purchaseListQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  search: z.string().trim().max(120).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
});

export const alternativesQuerySchema = z.object({
  category: z.enum(CATEGORIES),
  name: z.string().trim().min(1).max(120),
});
