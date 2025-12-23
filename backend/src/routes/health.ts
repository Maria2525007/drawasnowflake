import { Router } from 'express';
import { checkDbHealth, getDbStats } from '../utils/dbHealth.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

healthRouter.get('/db', async (_req, res) => {
  try {
    const health = await checkDbHealth();
    const stats = await getDbStats();

    if (health.status === 'healthy') {
      res.json({
        ...health,
        stats,
      });
    } else {
      res.status(503).json({
        ...health,
        stats,
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      connected: false,
      tablesExist: false,
      snowflakeCount: 0,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
