import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const snowflakeController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const snowflakes = await prisma.snowflake.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(snowflakes);
    } catch (error) {
      console.error('Error fetching snowflakes:', error);
      res.status(500).json({ error: 'Failed to get snowflakes' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const {
        x,
        y,
        rotation,
        scale,
        pattern,
        imageData,
        fallSpeed,
        driftSpeed,
        driftPhase,
      } = req.body;

      const snowflake = await prisma.snowflake.create({
        data: {
          x: x ?? 0,
          y: y ?? 0,
          rotation: rotation ?? 0,
          scale: scale ?? 1,
          pattern: pattern ?? 'custom',
          imageData: imageData || null,
          fallSpeed: fallSpeed ?? null,
          driftSpeed: driftSpeed ?? null,
          driftPhase: driftPhase ?? null,
        },
      });
      res.json(snowflake);
    } catch (error) {
      console.error('Error creating snowflake:', error);
      res.status(500).json({ error: 'Failed to create snowflake' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const snowflake = await prisma.snowflake.findUnique({
        where: { id },
      });
      if (!snowflake) {
        res.status(404).json({ error: 'Snowflake not found' });
        return;
      }
      res.json(snowflake);
    } catch (error) {
      console.error('Error fetching snowflake:', error);
      res.status(500).json({ error: 'Failed to get snowflake' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        x,
        y,
        rotation,
        scale,
        pattern,
        imageData,
        fallSpeed,
        driftSpeed,
        driftPhase,
      } = req.body;

      const snowflake = await prisma.snowflake.update({
        where: { id },
        data: {
          ...(x !== undefined && { x }),
          ...(y !== undefined && { y }),
          ...(rotation !== undefined && { rotation }),
          ...(scale !== undefined && { scale }),
          ...(pattern !== undefined && { pattern }),
          ...(imageData !== undefined && { imageData }),
          ...(fallSpeed !== undefined && { fallSpeed }),
          ...(driftSpeed !== undefined && { driftSpeed }),
          ...(driftPhase !== undefined && { driftPhase }),
        },
      });
      res.json(snowflake);
    } catch (error) {
      console.error('Error updating snowflake:', error);
      res.status(500).json({ error: 'Failed to update snowflake' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.snowflake.delete({
        where: { id },
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting snowflake:', error);
      res.status(500).json({ error: 'Failed to delete snowflake' });
    }
  },
};
