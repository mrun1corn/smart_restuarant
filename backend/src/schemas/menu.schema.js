import { z } from 'zod';

export const createMenuSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)]),
    imageUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)),
    isAvailable: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
    categoryId: z.string().uuid().optional().or(z.literal('')).or(z.literal(null)),
  }),
});

export const updateMenuSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)]).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)),
    isAvailable: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
    categoryId: z.string().uuid().optional().or(z.literal('')).or(z.literal(null)),
  }),
});
