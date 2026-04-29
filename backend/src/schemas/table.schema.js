import { z } from 'zod';

export const createTableSchema = z.object({
  body: z.object({
    tableNumber: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]),
  }),
});

export const updateTableSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    tableNumber: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    status: z.enum(['available', 'occupied', 'reserved']).optional(),
  }),
});
