import { Request, Response } from 'express';
import {
  getDAUStats,
  calculateDAUForDate,
  calculateDAUForRange,
  check1MDAUMilestone,
} from '../utils/dauCalculator.js';

export const metricsController = {
  /**
   * Get Daily Active Users statistics
   * GET /api/metrics/dau
   */
  getDAU: async (_req: Request, res: Response) => {
    try {
      const stats = await getDAUStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting DAU stats:', error);
      res.status(500).json({ error: 'Failed to get DAU statistics' });
    }
  },

  /**
   * Get DAU for a specific date
   * GET /api/metrics/dau/:date
   * Date format: YYYY-MM-DD
   */
  getDAUForDate: async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const count = await calculateDAUForDate(targetDate);
      res.json({ date: targetDate.toISOString().split('T')[0], count });
    } catch (error) {
      console.error('Error getting DAU for date:', error);
      res.status(500).json({ error: 'Failed to get DAU for date' });
    }
  },

  /**
   * Get DAU for a date range
   * GET /api/metrics/dau/range?start=YYYY-MM-DD&end=YYYY-MM-DD
   */
  getDAUForRange: async (req: Request, res: Response) => {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        res
          .status(400)
          .json({ error: 'Start and end dates are required (YYYY-MM-DD)' });
        return;
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      if (startDate > endDate) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }

      // Limit range to 90 days
      const daysDiff =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 90) {
        res.status(400).json({ error: 'Date range cannot exceed 90 days' });
        return;
      }

      const results = await calculateDAUForRange(startDate, endDate);
      res.json(results);
    } catch (error) {
      console.error('Error getting DAU for range:', error);
      res.status(500).json({ error: 'Failed to get DAU for range' });
    }
  },

  /**
   * Check 1M DAU milestone
   * GET /api/metrics/dau/milestone
   */
  getMilestone: async (_req: Request, res: Response) => {
    try {
      const milestone = await check1MDAUMilestone();
      res.json(milestone);
    } catch (error) {
      console.error('Error checking milestone:', error);
      res.status(500).json({ error: 'Failed to check milestone' });
    }
  },
};
