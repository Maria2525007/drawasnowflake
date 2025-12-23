import { checkDbHealth, getDbStats } from '../../utils/dbHealth';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: jest.fn(),
    snowflake: {
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('dbHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDbHealth', () => {
    it('should return healthy status when database is connected', async () => {
      const prisma = new PrismaClient();
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ table_name: 'snowflake' }]);
      (prisma.snowflake.count as jest.Mock).mockResolvedValue(10);

      const result = await checkDbHealth();

      expect(result.connected).toBe(true);
      expect(result.tablesExist).toBe(true);
      expect(result.status).toBe('healthy');
      expect(result.snowflakeCount).toBe(10);
    });

    it('should return unhealthy status when database is not connected', async () => {
      const prisma = new PrismaClient();
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(
        new Error('Connection error')
      );

      const result = await checkDbHealth();

      expect(result.connected).toBe(false);
      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeDefined();
    });

    it('should return unhealthy when tables do not exist', async () => {
      const prisma = new PrismaClient();
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ table_name: 'other_table' }])
        .mockResolvedValueOnce([]);

      const result = await checkDbHealth();

      expect(result.connected).toBe(true);
      expect(result.tablesExist).toBe(false);
      expect(result.status).toBe('unhealthy');
    });

    it('should handle errors gracefully', async () => {
      const prisma = new PrismaClient();
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await checkDbHealth();

      expect(result.error).toBeDefined();
      expect(result.status).toBe('unhealthy');
    });
  });

  describe('getDbStats', () => {
    it('should return database statistics', async () => {
      const prisma = new PrismaClient();
      const mockSnowflake = {
        id: '1',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-23'),
      };
      (prisma.snowflake.count as jest.Mock).mockResolvedValue(100);
      (prisma.snowflake.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockSnowflake)
        .mockResolvedValueOnce(mockSnowflake);

      const stats = await getDbStats();

      expect(stats).toHaveProperty('totalSnowflakes');
      expect(stats?.totalSnowflakes).toBe(100);
    });

    it('should return null when no snowflakes exist', async () => {
      const prisma = new PrismaClient();
      (prisma.snowflake.count as jest.Mock).mockResolvedValue(0);
      (prisma.snowflake.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const stats = await getDbStats();

      expect(stats?.totalSnowflakes).toBe(0);
      expect(stats?.oldestSnowflakeDate).toBeNull();
      expect(stats?.newestSnowflakeDate).toBeNull();
    });

    it('should handle errors', async () => {
      const prisma = new PrismaClient();
      (prisma.snowflake.count as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const stats = await getDbStats();

      expect(stats).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
