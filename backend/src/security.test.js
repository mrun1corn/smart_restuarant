import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from './app.js';
import prisma from './prisma.js';

vi.mock('./prisma.js', () => {
  return {
    default: {
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
      restaurantTable: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      menuItem: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    },
  };
});

describe('Security & Role Boundaries Integration Suite', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  let adminToken;
  let receptionistToken;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = JWT_SECRET;

    adminToken = jwt.sign(
      { id: 'admin-uuid', email: 'admin@restaurant.com', role: 'admin', name: 'Admin' },
      JWT_SECRET
    );

    receptionistToken = jwt.sign(
      { id: 'staff-uuid', email: 'staff@restaurant.com', role: 'receptionist', name: 'Staff' },
      JWT_SECRET
    );
  });

  describe('Order State Machine & Role Checks', () => {
    it('rejects order status update when unauthenticated', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/11111111-1111-4111-8111-111111111111/status')
        .send({ status: 'confirmed' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/);
    });

    it('rejects receptionist attempting to finalize order as "paid"', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        tableId: 'table-1',
        status: 'served',
      });

      const res = await request(app)
        .patch('/api/v1/orders/11111111-1111-4111-8111-111111111111/status')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ status: 'paid' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Only administrator can finalize/);
    });

    it('rejects invalid state transition from pending directly to paid', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        tableId: 'table-1',
        status: 'pending',
      });

      const res = await request(app)
        .patch('/api/v1/orders/11111111-1111-4111-8111-111111111111/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'paid' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid status transition/);
    });

    it('rejects any status transition from terminal state paid', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        tableId: 'table-1',
        status: 'paid',
      });

      const res = await request(app)
        .patch('/api/v1/orders/11111111-1111-4111-8111-111111111111/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Cannot change status of a finalized order/);
    });

    it('rejects receptionist from cancelling an order via DELETE', async () => {
      const res = await request(app)
        .delete('/api/v1/orders/11111111-1111-4111-8111-111111111111')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Admin access required/);
    });

    it('allows admin to cancel an active order via DELETE', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        tableId: 'table-1',
        status: 'pending',
      });
      prisma.order.update.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        status: 'cancelled',
      });
      prisma.order.count.mockResolvedValue(0);
      prisma.restaurantTable.update.mockResolvedValue({ id: 'table-1', status: 'available' });

      const res = await request(app)
        .delete('/api/v1/orders/11111111-1111-4111-8111-111111111111')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('cancelled');
    });
  });

  describe('Table Deletion Referential Integrity Guard', () => {
    it('blocks table deletion with 409 Conflict if order history exists', async () => {
      prisma.order.count.mockResolvedValue(5);

      const res = await request(app)
        .delete('/api/v1/tables/11111111-1111-4111-8111-111111111111')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/Cannot delete table with existing order history/);
      expect(prisma.restaurantTable.delete).not.toHaveBeenCalled();
    });

    it('permits table deletion if no orders are associated', async () => {
      prisma.order.count.mockResolvedValue(0);
      prisma.restaurantTable.delete.mockResolvedValue({ id: 'table-1' });

      const res = await request(app)
        .delete('/api/v1/tables/11111111-1111-4111-8111-111111111111')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(prisma.restaurantTable.delete).toHaveBeenCalledWith({
        where: { id: '11111111-1111-4111-8111-111111111111' },
      });
    });
  });

  describe('Sales Report Date-Bounded Protection', () => {
    it('applies default 90 days date filter and 10000 limit', async () => {
      prisma.order.findMany.mockResolvedValue([
        { totalPrice: '50.00', createdAt: new Date() },
        { totalPrice: '25.50', createdAt: new Date() },
      ]);

      const res = await request(app)
        .get('/api/v1/reports/sales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary.totalRevenue).toBe(75.5);
      expect(res.body.summary.totalOrders).toBe(2);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10000,
          where: expect.objectContaining({
            status: 'paid',
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });
});
