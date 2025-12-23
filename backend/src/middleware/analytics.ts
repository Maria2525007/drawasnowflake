import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generate or extract session ID from request
 */
function getSessionId(req: Request): string {
  // Try to get session ID from cookie
  let sessionId = req.cookies?.sessionId;

  // If no cookie, generate one based on IP + User-Agent
  if (!sessionId) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const hash = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');
    sessionId = hash.substring(0, 32);
  }

  return sessionId;
}

/**
 * Track user session for DAU calculation
 */
export async function trackUserSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Skip tracking for health checks and metrics endpoints
    if (
      req.path.startsWith('/api/health') ||
      req.path.startsWith('/api/metrics')
    ) {
      return next();
    }

    const sessionId = getSessionId(req);
    const userAgent = req.get('user-agent') || null;
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Check if session already exists for today
    const existingSession = await prisma.userSession.findFirst({
      where: {
        sessionId,
        date: {
          gte: today,
          lte: endOfToday,
        },
      },
    });

    // Only create new session if it doesn't exist for today
    if (!existingSession) {
      try {
        await prisma.userSession.create({
          data: {
            sessionId,
            userAgent,
            ipAddress,
            date: today, // Use start of day for consistent grouping
          },
        });
      } catch (error: any) {
        // Ignore unique constraint errors (race condition)
        if (error?.code !== 'P2002') {
          throw error;
        }
      }
    }

    // Set session cookie if not present
    if (!req.cookies?.sessionId) {
      res.cookie('sessionId', sessionId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        sameSite: 'lax',
      });
    }
  } catch (error) {
    // Don't block request if analytics fails
    console.error('Error tracking user session:', error);
  }

  next();
}
