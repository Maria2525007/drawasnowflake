import { Request, Response } from 'express';
import { metricsController } from '../../controllers/metricsController.js';
import * as dauCalculator from '../../utils/dauCalculator.js';

jest.mock('../../utils/dauCalculator.js');

describe('MetricsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    mockRequest = {};
    jest.clearAllMocks();
  });

  describe('getDAU', () => {
    it('should return DAU statistics', async () => {
      const mockStats = {
        today: 100,
        yesterday: 90,
        thisWeek: 500,
        thisMonth: 2000,
        allTime: 10000,
        growth: 11.11,
      };

      (dauCalculator.getDAUStats as jest.Mock).mockResolvedValue(mockStats);

      await metricsController.getDAU(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dauCalculator.getDAUStats).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockStats);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (dauCalculator.getDAUStats as jest.Mock).mockRejectedValue(error);

      await metricsController.getDAU(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to get DAU statistics',
      });
    });
  });

  describe('getDAUForDate', () => {
    it('should return DAU for a valid date', async () => {
      mockRequest.params = { date: '2024-01-15' };
      const mockCount = 150;

      (dauCalculator.calculateDAUForDate as jest.Mock).mockResolvedValue(
        mockCount
      );

      await metricsController.getDAUForDate(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dauCalculator.calculateDAUForDate).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        date: '2024-01-15',
        count: mockCount,
      });
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.params = { date: 'invalid-date' };

      await metricsController.getDAUForDate(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    });
  });

  describe('getDAUForRange', () => {
    it('should return DAU for a valid date range', async () => {
      mockRequest.query = { start: '2024-01-01', end: '2024-01-07' };
      const mockResults = [
        { date: new Date('2024-01-01'), count: 100 },
        { date: new Date('2024-01-02'), count: 120 },
      ];

      (dauCalculator.calculateDAUForRange as jest.Mock).mockResolvedValue(
        mockResults
      );

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dauCalculator.calculateDAUForRange).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockResults);
    });

    it('should return 400 for missing dates', async () => {
      mockRequest.query = { start: '2024-01-01' };

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Start and end dates are required (YYYY-MM-DD)',
      });
    });

    it('should return 400 for range exceeding 90 days', async () => {
      mockRequest.query = { start: '2024-01-01', end: '2024-04-15' };

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Date range cannot exceed 90 days',
      });
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.query = { start: 'invalid', end: '2024-01-07' };

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    });

    it('should return 400 if start date is after end date', async () => {
      mockRequest.query = { start: '2024-01-07', end: '2024-01-01' };

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Start date must be before end date',
      });
    });

    it('should handle errors', async () => {
      mockRequest.query = { start: '2024-01-01', end: '2024-01-07' };
      const error = new Error('Database error');
      (dauCalculator.calculateDAUForRange as jest.Mock).mockRejectedValue(error);

      await metricsController.getDAUForRange(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to get DAU for range',
      });
    });
  });

  describe('getDAUForDate error handling', () => {
    it('should handle errors', async () => {
      mockRequest.params = { date: '2024-01-15' };
      const error = new Error('Database error');
      (dauCalculator.calculateDAUForDate as jest.Mock).mockRejectedValue(error);

      await metricsController.getDAUForDate(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to get DAU for date',
      });
    });
  });

  describe('getMilestone', () => {
    it('should return milestone status', async () => {
      const mockMilestone = {
        reached: false,
        current: 500000,
        target: 1000000,
        percentage: 50.0,
      };

      (dauCalculator.check1MDAUMilestone as jest.Mock).mockResolvedValue(
        mockMilestone
      );

      await metricsController.getMilestone(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dauCalculator.check1MDAUMilestone).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockMilestone);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (dauCalculator.check1MDAUMilestone as jest.Mock).mockRejectedValue(error);

      await metricsController.getMilestone(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to check milestone',
        details: 'Database error',
      });
    });
  });
});
