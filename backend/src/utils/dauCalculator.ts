import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DAUResult {
  date: Date;
  count: number;
}

export interface DAUStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  growth: number; // percentage change from yesterday
}

/**
 * Calculate Daily Active Users for a specific date
 */
export async function calculateDAUForDate(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.userSession.count({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    distinct: ['sessionId'],
  });

  return count;
}

/**
 * Calculate DAU for a date range
 */
export async function calculateDAUForRange(
  startDate: Date,
  endDate: Date
): Promise<DAUResult[]> {
  const results: DAUResult[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const count = await calculateDAUForDate(currentDate);
    results.push({
      date: new Date(currentDate),
      count,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
}

/**
 * Get comprehensive DAU statistics
 */
export async function getDAUStats(): Promise<DAUStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayCount, yesterdayCount, thisWeekSessions, thisMonthSessions, allTimeSessions] =
    await Promise.all([
      calculateDAUForDate(today),
      calculateDAUForDate(yesterday),
      prisma.userSession.findMany({
        where: {
          date: {
            gte: thisWeekStart,
          },
        },
        select: {
          sessionId: true,
        },
        distinct: ['sessionId'],
      }),
      prisma.userSession.findMany({
        where: {
          date: {
            gte: thisMonthStart,
          },
        },
        select: {
          sessionId: true,
        },
        distinct: ['sessionId'],
      }),
      prisma.userSession.findMany({
        select: {
          sessionId: true,
        },
        distinct: ['sessionId'],
      }),
    ]);

  const thisWeekCount = thisWeekSessions.length;
  const thisMonthCount = thisMonthSessions.length;
  const allTimeCount = allTimeSessions.length;

  const growth =
    yesterdayCount > 0
      ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
      : todayCount > 0
        ? 100
        : 0;

  return {
    today: todayCount,
    yesterday: yesterdayCount,
    thisWeek: thisWeekCount,
    thisMonth: thisMonthCount,
    allTime: allTimeCount,
    growth: Math.round(growth * 100) / 100,
  };
}

/**
 * Check if we've reached 1M DAU milestone
 */
export async function check1MDAUMilestone(): Promise<{
  reached: boolean;
  current: number;
  target: number;
  percentage: number;
}> {
  const stats = await getDAUStats();
  const target = 1_000_000;
  const current = stats.allTime;
  const reached = current >= target;
  const percentage = (current / target) * 100;

  return {
    reached,
    current,
    target,
    percentage: Math.round(percentage * 100) / 100,
  };
}
