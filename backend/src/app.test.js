import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('API Health Check', () => {
  it('should return 200 and ok status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Smart Restaurant API is running',
    });
  });
});
