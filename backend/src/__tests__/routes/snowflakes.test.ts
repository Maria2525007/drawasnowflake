import request from 'supertest';
import express from 'express';
import { snowflakeRouter } from '../../routes/snowflakes';

jest.mock('../../controllers/snowflakeController', () => ({
  snowflakeController: {
    create: jest.fn(async (_req, res) => res.json({ id: '1', x: 100, y: 100 })),
    getAll: jest.fn(async (_req, res) => res.json([{ id: '1', x: 100, y: 100 }])),
    getById: jest.fn(async (req, res) => res.json({ id: req.params.id, x: 100, y: 100 })),
    update: jest.fn(async (req, res) => res.json({ id: req.params.id, ...req.body })),
    delete: jest.fn(async (_req, res) => res.json({ success: true })),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/snowflakes', snowflakeRouter);

describe('Snowflake Routes', () => {
  it('should create snowflake', async () => {
    const response = await request(app)
      .post('/api/snowflakes')
      .send({ x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should get all snowflakes', async () => {
    const response = await request(app).get('/api/snowflakes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get snowflake by id', async () => {
    const response = await request(app).get('/api/snowflakes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
  });

  it('should update snowflake', async () => {
    const response = await request(app)
      .put('/api/snowflakes/1')
      .send({ x: 200, y: 200 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('x', 200);
  });

  it('should delete snowflake', async () => {
    const response = await request(app).delete('/api/snowflakes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

