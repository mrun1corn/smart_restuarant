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
});
