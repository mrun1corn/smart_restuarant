import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('Validation Middleware', () => {
  it('should return 400 if login data is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'invalid-email', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toContainEqual(expect.objectContaining({
      path: 'body.email',
      message: 'Invalid email address',
    }));
    expect(response.body.details).toContainEqual(expect.objectContaining({
      path: 'body.password',
      message: 'Password must be at least 6 characters',
    }));
  });

  it('should pass validation with correct data (but fail auth)', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    // It should NOT be 400 (validation error). It might be 401 or 404 depending on if user exists.
    expect(response.status).not.toBe(400);
  });

  it('should enforce authentication on protected endpoints', async () => {
    const tableRes = await request(app).get('/api/v1/tables');
    expect(tableRes.status).toBe(401);
    expect(tableRes.body.error).toMatch(/Unauthorized/);

    const orderCancelRes = await request(app).delete('/api/v1/orders/11111111-1111-1111-1111-111111111111');
    expect(orderCancelRes.status).toBe(401);
    expect(orderCancelRes.body.error).toMatch(/Unauthorized/);

    const reportRes = await request(app).get('/api/v1/reports/sales');
    expect(reportRes.status).toBe(401);
    expect(reportRes.body.error).toMatch(/Unauthorized/);
  });

  it('should validate customer order payload rejecting invalid table UUID', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .send({
        table_id: 'not-a-uuid',
        items: [{ menu_item_id: '22222222-2222-2222-2222-222222222222', quantity: 1 }]
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });
});
