import request from 'supertest';
import express from 'express';
import { metricsRouter } from '../../routes/metrics';

jest.mock('../../controllers/metricsController', () => ({
  metricsController: {
    getDAU: jest.fn(async (_req, res) =>
      res.json({ today: 100, yesterday: 90, thisWeek: 500 })
    ),
    getDAUForDate: jest.fn(async (req, res) =>
      res.json({ date: req.params.date, count: 50 })
    ),
    getDAUForRange: jest.fn(async (_req, res) =>
      res.json([{ date: '2024-12-01', count: 100 }])
    ),
    getMilestone: jest.fn(async (_req, res) =>
      res.json({ achieved: false, currentDAU: 1000 })
    ),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/metrics', metricsRouter);

describe('Metrics Routes', () => {
  it('should get DAU stats', async () => {
    const response = await request(app).get('/api/metrics/dau');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('today');
    expect(response.body).toHaveProperty('yesterday');
  });

  it('should get DAU for specific date', async () => {
    const response = await request(app).get('/api/metrics/dau/2024-12-23');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('date');
    expect(response.body).toHaveProperty('count');
  });

  it('should get DAU milestone', async () => {
    const response = await request(app).get('/api/metrics/dau/milestone');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('achieved');
  });

  it('should get DAU range', async () => {
    const response = await request(app).get(
      '/api/metrics/dau/range?start=2024-12-01&end=2024-12-23'
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
