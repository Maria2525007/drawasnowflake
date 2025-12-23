import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DbHealthStatus {
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  tablesExist: boolean;
  snowflakeCount: number;
  lastCheck: Date;
  error?: string;
}

export async function checkDbHealth(): Promise<DbHealthStatus> {
  const result: DbHealthStatus = {
    status: 'unhealthy',
    connected: false,
    tablesExist: false,
    snowflakeCount: 0,
    lastCheck: new Date(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.connected = true;

    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Snowflake'
    `;
    result.tablesExist = tables.length > 0;

    if (result.tablesExist) {
      result.snowflakeCount = await prisma.snowflake.count();
    }

    result.status =
      result.connected && result.tablesExist ? 'healthy' : 'unhealthy';
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'unhealthy';
  }

  return result;
}

export async function getDbStats() {
  try {
    const snowflakeCount = await prisma.snowflake.count();
    const oldestSnowflake = await prisma.snowflake.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const newestSnowflake = await prisma.snowflake.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      totalSnowflakes: snowflakeCount,
      oldestSnowflakeDate: oldestSnowflake?.createdAt || null,
      newestSnowflakeDate: newestSnowflake?.createdAt || null,
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return null;
  }
}
