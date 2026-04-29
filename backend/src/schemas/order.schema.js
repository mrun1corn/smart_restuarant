import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    table_id: z.string().uuid('Invalid table ID'),
    note: z.string().optional(),
    items: z.array(z.object({
      menu_item_id: z.string().uuid('Invalid menu item ID'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      note: z.string().optional(),
    })).min(1, 'Order must contain at least one item'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'served', 'paid', 'cancelled']),
  }),
});
