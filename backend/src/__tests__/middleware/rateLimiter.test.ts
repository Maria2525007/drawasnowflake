import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../../middleware/rateLimiter';

const app = express();
const rateLimiter = createRateLimiter(15 * 60 * 1000, 100);
app.use('/api/', rateLimiter);
app.get('/api/test', (_req, res) => res.json({ message: 'ok' }));

describe('rateLimiter', () => {
  it('should allow requests within limit', async () => {
    const response = await request(app).get('/api/test');
    expect(response.status).toBe(200);
  });

  it('should create rate limiter with custom settings', () => {
    const limiter = createRateLimiter(1000, 10);
    expect(limiter).toBeDefined();
  });
});

