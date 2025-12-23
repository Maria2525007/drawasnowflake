import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const snowflakeController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const snowflakes = await prisma.snowflake.findMany({
        orderBy: { createdAt: 'desc' },
      });
      console.log(`Fetched ${snowflakes.length} snowflakes from database`);
      res.json(snowflakes);
    } catch (error) {
      console.error('Error fetching snowflakes:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        error: 'Failed to get snowflakes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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

      console.log('Creating snowflake:', {
        x,
        y,
        rotation,
        scale,
        pattern,
        hasImageData: !!imageData,
        imageDataLength: imageData?.length || 0,
        fallSpeed,
        driftSpeed,
        driftPhase,
      });

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

      console.log('Snowflake created successfully with ID:', snowflake.id);
      res.json(snowflake);
    } catch (error) {
      console.error('Error creating snowflake:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        error: 'Failed to create snowflake',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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

  deleteAll: async (_req: Request, res: Response) => {
    try {
      const result = await prisma.snowflake.deleteMany({});
      console.log(`Deleted ${result.count} snowflakes from database`);
      res.json({ 
        success: true, 
        deletedCount: result.count,
        message: `Successfully deleted ${result.count} snowflake(s) from database`
      });
    } catch (error) {
      console.error('Error deleting all snowflakes:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        error: 'Failed to delete all snowflakes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
};
