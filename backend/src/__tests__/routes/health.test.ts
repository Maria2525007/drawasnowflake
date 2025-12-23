import request from 'supertest';
import express from 'express';
import { healthRouter } from '../../routes/health';
import * as dbHealth from '../../utils/dbHealth';

jest.mock('../../utils/dbHealth');

const app = express();
app.use('/api/health', healthRouter);

describe('Health Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return database health when healthy', async () => {
    const mockHealth = {
      status: 'healthy',
      connected: true,
      tablesExist: true,
      snowflakeCount: 10,
    };
    const mockStats = {
      totalSnowflakes: 10,
      oldestSnowflakeDate: new Date('2024-12-01'),
      newestSnowflakeDate: new Date('2024-12-23'),
    };

    (dbHealth.checkDbHealth as jest.Mock).mockResolvedValue(mockHealth);
    (dbHealth.getDbStats as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app).get('/api/health/db');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('stats');
  });

  it('should return 503 when database is unhealthy', async () => {
    const mockHealth = {
      status: 'unhealthy',
      connected: false,
      tablesExist: false,
      snowflakeCount: 0,
    };
    const mockStats = null;

    (dbHealth.checkDbHealth as jest.Mock).mockResolvedValue(mockHealth);
    (dbHealth.getDbStats as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app).get('/api/health/db');
    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'unhealthy');
  });

  it('should handle errors', async () => {
    (dbHealth.checkDbHealth as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const response = await request(app).get('/api/health/db');
    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'unhealthy');
    expect(response.body).toHaveProperty('error');
  });
});
