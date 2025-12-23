import { Router } from 'express';
import { metricsController } from '../controllers/metricsController.js';

export const metricsRouter = Router();

metricsRouter.get('/dau', metricsController.getDAU);
metricsRouter.get('/dau/milestone', metricsController.getMilestone);
metricsRouter.get('/dau/range', metricsController.getDAUForRange);
metricsRouter.get('/dau/:date', metricsController.getDAUForDate);
