import request from 'supertest';
import express from 'express';
import { healthRouter } from '../../routes/health';

const app = express();
app.use('/api/health', healthRouter);

describe('Health Router', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
