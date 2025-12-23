import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function getSessionId(req: Request): string {
  let sessionId = req.cookies?.sessionId;

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

export async function trackUserSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
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

    const existingSession = await prisma.userSession.findFirst({
      where: {
        sessionId,
        date: {
          gte: today,
          lte: endOfToday,
        },
      },
    });

    if (!existingSession) {
      try {
        await prisma.userSession.create({
          data: {
            sessionId,
            userAgent,
            ipAddress,
            date: today,
          },
        });
      } catch (error: unknown) {
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code !== 'P2002'
        ) {
          throw error;
        }
      }
    }

    if (!req.cookies?.sessionId) {
      res.cookie('sessionId', sessionId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      });
    }
  } catch (error) {
    console.error('Error tracking user session:', error);
  }

  next();
}
